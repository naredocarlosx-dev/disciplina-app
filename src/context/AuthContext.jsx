import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser,       setCurrentUser]       = useState(null)
  const [subscription,      setSubscription]      = useState({ plan: 'free' })
  const [authLoading,       setAuthLoading]        = useState(true)
  const [resetPasswordMode, setResetPasswordMode] = useState(() =>
    new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery'
  )

  // Carga perfil + suscripción desde Supabase
  const loadProfile = useCallback(async (authUser) => {
    let { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    // Auto-provision profile for first-time OAuth users (Google, etc.)
    if ((error || !profile) && authUser.app_metadata?.provider !== 'email') {
      const name = authUser.user_metadata?.full_name
        || authUser.user_metadata?.name
        || authUser.email?.split('@')[0]
        || 'Usuario'
      const trialStart = new Date().toISOString()
      const trialEnd   = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()

      await Promise.all([
        supabase.from('profiles').upsert(
          { id: authUser.id, name, email: authUser.email, role: 'user', status: 'active',
            trial_start_date: trialStart, trial_end_date: trialEnd, trial_used: true },
          { onConflict: 'id' }
        ),
        supabase.from('subscriptions').upsert(
          { user_id: authUser.id, plan: 'free' },
          { onConflict: 'user_id' }
        ),
      ])

      // Welcome email (fire-and-forget)
      fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'welcome', email: authUser.email, name }),
      }).catch(() => {})

      // Re-fetch the newly created profile
      const fresh = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
      profile = fresh.data
      if (!profile) return null
    } else if (error || !profile) {
      return null
    }

    if (profile.status === 'inactive') {
      await supabase.auth.signOut()
      return null
    }

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', authUser.id)
      .single()

    // Auto-downgrade expired promo subscriptions (non-Stripe, with expiry date)
    let effectiveSub = sub || { plan: 'free' }
    if (effectiveSub.plan === 'pro' && effectiveSub.expires_at && !effectiveSub.stripe_customer_id) {
      if (new Date(effectiveSub.expires_at) < new Date()) {
        await supabase.from('subscriptions')
          .update({ plan: 'free' })
          .eq('user_id', authUser.id)
        effectiveSub = { plan: 'free' }
      }
    }

    // Compute trial expiry (only for non-PRO users that have a trial_end_date)
    const trialExpired = (() => {
      if (!profile.trial_end_date) return false
      if (effectiveSub.plan === 'pro') return false
      return new Date(profile.trial_end_date) < new Date()
    })()

    const trialDaysLeft = profile.trial_end_date && !trialExpired
      ? Math.max(0, Math.ceil((new Date(profile.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24)))
      : 0

    const user = {
      id: authUser.id,
      email: authUser.email,
      name: profile.name,
      role: profile.role,
      status: profile.status,
      created: profile.created_at,
      provider: authUser.app_metadata?.provider || 'email',
      trialExpired,
      trialDaysLeft,
      trialEndDate: profile.trial_end_date || null,
    }

    setCurrentUser(user)
    setSubscription(effectiveSub)
    return user
  }, [])

  // Revisar sesión activa al montar
  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setResetPasswordMode(true)
        setAuthLoading(false)
        return
      }
      if (event === 'INITIAL_SESSION') {
        const isRecovery = new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery'
        if (!isRecovery && session?.user) {
          try {
            await loadProfile(session.user)
          } catch (e) {
            console.error('[auth] loadProfile error on INITIAL_SESSION:', e)
          }
        }
        setAuthLoading(false)
        return
      }
      if (event === 'SIGNED_IN') {
        if (session?.user) {
          try {
            await loadProfile(session.user)
          } catch (e) {
            console.error('[auth] loadProfile error on SIGNED_IN:', e)
          }
          // Detect email confirmation: confirmed_at is very recent (< 5 min)
          const confirmedAt = session.user.email_confirmed_at
          const isEmailProvider = (session.user.app_metadata?.provider || 'email') === 'email'
          const isJustConfirmed = confirmedAt &&
            (Date.now() - new Date(confirmedAt).getTime()) < 5 * 60 * 1000
          if (isEmailProvider && isJustConfirmed) {
            const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuario'
            fetch('/.netlify/functions/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'welcome', email: session.user.email, name }),
            }).catch(() => {})
          }
        }
        setAuthLoading(false)
        return
      }
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null)
        setSubscription({ plan: 'free' })
        setResetPasswordMode(false)
      }
    })

    return () => authSub.unsubscribe()
  }, [loadProfile])

  // Re-sync plan from Supabase when the subscriptions row changes (Realtime)
  // or when the user tabs back to the app (visibility/focus fallback)
  useEffect(() => {
    if (!currentUser?.id) return

    const refresh = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) loadProfile(user)
    }

    const channel = supabase
      .channel(`sub-sync-${currentUser.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'subscriptions',
        filter: `user_id=eq.${currentUser.id}`,
      }, refresh)
      .subscribe()

    const handleVisibility = () => { if (document.visibilityState === 'visible') refresh() }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', refresh)

    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', refresh)
    }
  }, [currentUser?.id, loadProfile])

  const doLogin = useCallback(async (email, pass) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) {
      if (error.code === 'email_not_confirmed' || error.message?.toLowerCase().includes('email not confirmed')) {
        return { ok: false, error: 'Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.' }
      }
      return { ok: false, error: 'Correo o contraseña incorrectos.' }
    }

    const user = await loadProfile(data.user)
    if (!user) return { ok: false, error: 'Esta cuenta está desactivada. Contacta al administrador.' }

    return { ok: true, user }
  }, [loadProfile])

  const doRegister = useCallback(async ({ name, email, pass, pass2 }) => {
    if (!name || !email || !pass) return { ok: false, error: 'Por favor completa todos los campos.' }
    if (pass.length < 6) return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres.' }
    if (pass !== pass2) return { ok: false, error: 'Las contraseñas no coinciden.' }

    // Check if this email already used its free trial
    try {
      const trialCheck = await fetch('/.netlify/functions/check-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (trialCheck.ok) {
        const { trialUsed } = await trialCheck.json()
        if (trialUsed) {
          return { ok: false, error: 'Este correo ya utilizó la prueba gratuita. Para continuar necesitas activar el plan PRO.' }
        }
      }
    } catch (_) { /* if check fails, allow registration */ }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { name }, emailRedirectTo: window.location.origin },
    })

    if (error) {
      if (error.message.toLowerCase().includes('already')) {
        return { ok: false, error: 'Ya existe una cuenta con ese correo.' }
      }
      return { ok: false, error: error.message }
    }

    // Supabase devuelve user=null, session=null (sin error) cuando el correo ya existe
    // pero no está confirmado — simplemente reenvía el email de confirmación silenciosamente.
    if (!data.user && !data.session) {
      return { ok: true, needsConfirmation: true }
    }

    if (!data.user) return { ok: false, error: 'Error al crear la cuenta. Intenta de nuevo.' }

    // Crear perfil y suscripción (el trigger de Supabase también lo hace como respaldo)
    const trialStart = new Date().toISOString()
    const trialEnd   = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    await Promise.all([
      supabase.from('profiles').upsert(
        { id: data.user.id, name, email, role: 'user', status: 'active',
          trial_start_date: trialStart, trial_end_date: trialEnd, trial_used: true },
        { onConflict: 'id' }
      ),
      supabase.from('subscriptions').upsert(
        { user_id: data.user.id, plan: 'free' },
        { onConflict: 'user_id' }
      ),
    ])

    if (!data.session) {
      return { ok: true, needsConfirmation: true }
    }

    const user = await loadProfile(data.user)
    if (!user) return { ok: false, error: 'Error al cargar el perfil. Intenta iniciar sesión.' }

    return { ok: true, user }
  }, [loadProfile])

  const doLogout = useCallback(async () => {
    await supabase.auth.signOut()
    setCurrentUser(null)
    setSubscription({ plan: 'free' })
  }, [])

  const sendPasswordReset = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'https://episodiouno.com',
    })
    if (error) return { ok: false, error: 'No pudimos enviar el correo. Verifica que el email sea correcto.' }
    return { ok: true }
  }, [])

  const confirmNewPassword = useCallback(async (newPass) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPass })
    if (error) return { ok: false, error: error.message }
    if (data.user) await loadProfile(data.user)
    setResetPasswordMode(false)
    return { ok: true }
  }, [loadProfile])

  const updateName = useCallback(async (name) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'No hay sesión activa.' }
    const { error } = await supabase.from('profiles').update({ name }).eq('id', user.id)
    if (error) return { ok: false, error: error.message }
    setCurrentUser(prev => ({ ...prev, name }))
    return { ok: true }
  }, [])

  const updatePassword = useCallback(async (newPass) => {
    const { error } = await supabase.auth.updateUser({ password: newPass })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }, [])

  const upgradeToPro = useCallback(async () => {
    if (!currentUser) return
    const { data } = await supabase
      .from('subscriptions')
      .upsert({ user_id: currentUser.id, plan: 'pro' }, { onConflict: 'user_id' })
      .select()
      .single()
    setSubscription(data || { plan: 'pro' })
  }, [currentUser])

  const value = {
    currentUser,
    subscription,
    authLoading,
    resetPasswordMode,
    doLogin,
    doRegister,
    doLogout,
    upgradeToPro,
    updateName,
    updatePassword,
    sendPasswordReset,
    confirmNewPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
