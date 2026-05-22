import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { fetchAppState } from '../lib/db'
import { useAuth } from './AuthContext'
import { todayKey, ALERT_PCT } from '../constants'

export const AppContext = createContext(null)

// ─── Provider ────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const { currentUser, subscription, authLoading, upgradeToPro, doLogin, doRegister, doLogout } = useAuth()

  const [screen,    setScreen]    = useState('loading')
  const [appPage,   setAppPage]   = useState('dashboard')
  const [adminPage, setAdminPage] = useState('users')
  const [appState,  setAppState]  = useState(null)
  const [appLoading, setAppLoading] = useState(false)
  const [modal,     setModal]     = useState(null)
  const [modalData, setModalData] = useState(null)
  const [authState, setAuthState] = useState({ users: [] }) // lista de usuarios para el admin

  // ── Modales ────────────────────────────────────────────────────────────────
  const openModal  = useCallback((name, data = null) => { setModal(name); setModalData(data) }, [])
  const closeModal = useCallback(() => { setModal(null); setModalData(null) }, [])

  // ── Navegación según sesión ────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return

    if (!currentUser) {
      setScreen(prev => prev === 'loading' ? 'landing' : prev)
      return
    }

    const loadData = async () => {
      setAppLoading(true)
      try {
        const state = await fetchAppState(currentUser.id)
        setAppState(state)

        if (currentUser.role === 'admin') {
          const { data: profiles } = await supabase
            .from('profiles').select('*').order('created_at')
          setAuthState({ users: (profiles || []).map(p => ({ ...p, created: p.created_at })) })
          setAdminPage('users')
          setScreen('admin')
        } else {
          setAppPage('dashboard')
          setScreen('app')
        }
      } finally {
        setAppLoading(false)
      }
    }
    loadData()
  }, [currentUser, authLoading])

  // Cuando hace logout vuelve a auth
  useEffect(() => {
    if (!authLoading && !currentUser && screen !== 'loading' && screen !== 'landing') {
      setScreen('auth')
      setAppState(null)
    }
  }, [currentUser, authLoading, screen])

  // ── Helper interno ─────────────────────────────────────────────────────────
  const update = useCallback((updater) => {
    setAppState(prev => typeof updater === 'function' ? updater(prev) : updater)
  }, [])

  const calcProgress = (habits) => {
    const done = habits.filter(h => h.doneToday).length
    return habits.length ? Math.round(done / habits.length * 100) : 0
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HÁBITOS
  // ═══════════════════════════════════════════════════════════════════════════
  const toggleHabit = useCallback(async (id) => {
    let toggled = null

    setAppState(prev => {
      const habits = prev.habits.map(h => {
        if (h.id !== id) return h
        const doneToday = !h.doneToday
        const streak    = doneToday ? h.streak + 1 : Math.max(0, h.streak - 1)
        const updated   = { ...h, doneToday, streak, history: { ...h.history, [todayKey]: doneToday } }
        toggled = updated
        return updated
      })
      const pct = calcProgress(habits)
      return { ...prev, habits, progressHistory: { ...prev.progressHistory, [todayKey]: pct } }
    })

    if (!toggled || !currentUser) return
    supabase.from('habits').update({ streak: toggled.streak, history: toggled.history }).eq('id', id)
    supabase.from('habit_logs').upsert(
      { habit_id: id, user_id: currentUser.id, log_date: todayKey, done: toggled.doneToday },
      { onConflict: 'habit_id,log_date' }
    )
    // Guardar progreso en perfil (sin await para no bloquear)
    setAppState(prev => {
      if (prev) supabase.from('profiles').update({ progress_history: prev.progressHistory }).eq('id', currentUser.id)
      return prev
    })
  }, [currentUser])

  const addHabit = useCallback(async ({ name, cat }) => {
    // Límite plan FREE: máximo 3 hábitos
    if (subscription?.plan === 'free' && (appState?.habits?.length ?? 0) >= 3) {
      openModal('upgrade')
      return
    }
    const id  = crypto.randomUUID()
    const row = { id, name, cat, doneToday: false, streak: 0, history: {} }
    update(prev => {
      const habits = [...prev.habits, row]
      return { ...prev, habits, progressHistory: { ...prev.progressHistory, [todayKey]: calcProgress(habits) } }
    })
    if (currentUser) supabase.from('habits').insert({ id, user_id: currentUser.id, name, cat, streak: 0, history: {} })
  }, [currentUser, subscription, appState, openModal, update])

  const deleteHabit = useCallback(async (id) => {
    update(prev => {
      const habits = prev.habits.filter(h => h.id !== id)
      return { ...prev, habits, progressHistory: { ...prev.progressHistory, [todayKey]: calcProgress(habits) } }
    })
    if (currentUser) supabase.from('habits').delete().eq('id', id)
  }, [currentUser, update])

  // ═══════════════════════════════════════════════════════════════════════════
  // AHORROS
  // ═══════════════════════════════════════════════════════════════════════════
  const addSaving = useCallback(async ({ name, goal, deadline }) => {
    // Límite plan FREE: máxima 1 meta
    if (subscription?.plan === 'free' && (appState?.savings?.length ?? 0) >= 1) {
      openModal('upgrade')
      return
    }
    const id  = crypto.randomUUID()
    const row = { id, name, goal: parseFloat(goal), current: 0, deadline: deadline || '' }
    update(prev => ({ ...prev, savings: [...prev.savings, row] }))
    if (currentUser) {
      supabase.from('savings').insert({ id, user_id: currentUser.id, name, goal: parseFloat(goal), current_amount: 0, deadline: deadline || null })
    }
  }, [currentUser, subscription, appState, openModal, update])

  const deleteSaving = useCallback(async (id) => {
    update(prev => ({ ...prev, savings: prev.savings.filter(s => s.id !== id) }))
    if (currentUser) supabase.from('savings').delete().eq('id', id)
  }, [currentUser, update])

  const openContribute = useCallback((id) => openModal('contribute', { savingId: id }), [openModal])

  const addContribution = useCallback(async (amount) => {
    const savingId = modalData?.savingId
    let newCurrent = 0
    update(prev => ({
      ...prev,
      savings: prev.savings.map(s => {
        if (s.id !== savingId) return s
        newCurrent = Math.min(s.goal, s.current + parseFloat(amount))
        return { ...s, current: newCurrent }
      }),
    }))
    if (currentUser && savingId) {
      supabase.from('savings').update({ current_amount: newCurrent }).eq('id', savingId)
      supabase.from('saving_contributions').insert({ saving_id: savingId, user_id: currentUser.id, amount: parseFloat(amount) })
    }
    closeModal()
  }, [currentUser, modalData, update, closeModal])

  // ═══════════════════════════════════════════════════════════════════════════
  // COMIDAS
  // ═══════════════════════════════════════════════════════════════════════════
  const selectDay = useCallback((day) => {
    update(prev => ({ ...prev, selectedDay: day }))
    if (currentUser) supabase.from('profiles').update({ selected_day: day }).eq('id', currentUser.id)
  }, [currentUser, update])

  const openMealEditor = useCallback(() => openModal('meal-editor'), [openModal])

  const saveMeals = useCallback(async (slots) => {
    update(prev => ({ ...prev, meals: { ...prev.meals, [prev.selectedDay]: slots } }))
    if (!currentUser || appState === null) { closeModal(); return }

    const day = appState.selectedDay
    const rows = Object.entries(slots).map(([slot, { food, time }]) => ({
      user_id: currentUser.id, day_of_week: day, slot, food: food || '', time: time || '',
    }))
    if (rows.length) supabase.from('meals').upsert(rows, { onConflict: 'user_id,day_of_week,slot' })
    closeModal()
  }, [currentUser, appState, update, closeModal])

  const saveDietPlan = useCallback(async ({ name, desc }) => {
    const dietPlan = { name, desc }
    update(prev => ({ ...prev, dietPlan }))
    if (currentUser) supabase.from('profiles').update({ diet_plan: dietPlan }).eq('id', currentUser.id)
    closeModal()
  }, [currentUser, update, closeModal])

  // ═══════════════════════════════════════════════════════════════════════════
  // FITNESS
  // ═══════════════════════════════════════════════════════════════════════════
  const COLORS = ['#185FA5', '#1D9E75', '#D85A30', '#BA7517', '#534AB7', '#D4537E']

  const addWorkout = useCallback(async ({ name, days }) => {
    const id    = crypto.randomUUID()
    const color = COLORS[(appState?.workouts?.length ?? 0) % COLORS.length]
    update(prev => ({ ...prev, workouts: [...prev.workouts, { id, name, days, color, done: [] }] }))
    if (currentUser) supabase.from('workouts').insert({ id, user_id: currentUser.id, name, days, color })
    closeModal()
  }, [currentUser, appState, update, closeModal])

  const toggleWorkoutDone = useCallback(async (id) => {
    let nowDone = false
    update(prev => ({
      ...prev,
      workouts: prev.workouts.map(w => {
        if (w.id !== id) return w
        const done = w.done.includes(todayKey)
          ? w.done.filter(d => d !== todayKey)
          : [...w.done, todayKey]
        nowDone = done.includes(todayKey)
        return { ...w, done }
      }),
    }))
    if (!currentUser) return
    if (nowDone) {
      supabase.from('workout_logs').upsert(
        { workout_id: id, user_id: currentUser.id, log_date: todayKey },
        { onConflict: 'workout_id,log_date' }
      )
    } else {
      supabase.from('workout_logs').delete().eq('workout_id', id).eq('log_date', todayKey)
    }
  }, [currentUser, update])

  const deleteWorkout = useCallback(async (id) => {
    update(prev => ({ ...prev, workouts: prev.workouts.filter(w => w.id !== id) }))
    if (currentUser) supabase.from('workouts').delete().eq('id', id)
  }, [currentUser, update])

  // ═══════════════════════════════════════════════════════════════════════════
  // INVENTARIO
  // ═══════════════════════════════════════════════════════════════════════════
  const openInvAdd  = useCallback(() => openModal('inv-add', { editId: null }), [openModal])
  const openEditInv = useCallback((id) => openModal('inv-add', { editId: id }), [openModal])
  const openInvMove = useCallback((id) => openModal('inv-move', { moveId: id }), [openModal])

  const saveInvProduct = useCallback(async ({ name, cat, unit, qty, max }) => {
    const editId = modalData?.editId
    if (editId) {
      update(prev => ({
        ...prev,
        inventory: prev.inventory.map(p =>
          p.id === editId ? { ...p, name, cat, unit, qty: parseFloat(qty) || 0, max: parseFloat(max) || 100 } : p
        ),
      }))
      if (currentUser) supabase.from('inventory').update({ name, cat, unit, qty: parseFloat(qty) || 0, max_qty: parseFloat(max) || 100 }).eq('id', editId)
    } else {
      const id = crypto.randomUUID()
      update(prev => ({
        ...prev,
        inventory: [...prev.inventory, { id, name, cat, unit, qty: parseFloat(qty) || 0, max: parseFloat(max) || 100 }],
      }))
      if (currentUser) supabase.from('inventory').insert({ id, user_id: currentUser.id, name, cat, unit, qty: parseFloat(qty) || 0, max_qty: parseFloat(max) || 100 })
    }
    closeModal()
  }, [currentUser, modalData, update, closeModal])

  const deleteInvItem = useCallback(async (id) => {
    update(prev => ({ ...prev, inventory: prev.inventory.filter(p => p.id !== id) }))
    if (currentUser) supabase.from('inventory').delete().eq('id', id)
  }, [currentUser, update])

  const saveInvMove = useCallback(async ({ qty, note, mvType }) => {
    const p = appState?.inventory.find(x => x.id === modalData?.moveId)
    if (!p) { closeModal(); return }

    const newQty = mvType === 'use'
      ? Math.max(0, parseFloat((p.qty - qty).toFixed(4)))
      : Math.min(p.max, parseFloat((p.qty + qty).toFixed(4)))

    const dateStr = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    const logId   = crypto.randomUUID()
    const logRow  = { id: logId, name: p.name, type: mvType, qty, unit: p.unit, note, date: dateStr }

    update(prev => ({
      ...prev,
      inventory: prev.inventory.map(x => x.id === p.id ? { ...x, qty: newQty } : x),
      invLog:    [logRow, ...prev.invLog],
    }))

    if (currentUser) {
      supabase.from('inventory').update({ qty: newQty }).eq('id', p.id)
      supabase.from('inventory_logs').insert({
        id: logId, user_id: currentUser.id, inventory_id: p.id,
        item_name: p.name, move_type: mvType, qty, unit: p.unit, note: note || '', log_date: dateStr,
      })
    }
    closeModal()
  }, [currentUser, appState, modalData, update, closeModal])

  const setInvFilter = useCallback((cat) => update(prev => ({ ...prev, invFilter: cat })), [update])

  // ── Alertas ────────────────────────────────────────────────────────────────
  const getAlerts = useCallback(() => {
    if (!appState) return { empty: [], low: [], total: 0 }
    const empty = appState.inventory.filter(p => p.qty <= 0)
    const low   = appState.inventory.filter(p => p.qty > 0 && (p.qty / p.max * 100) <= ALERT_PCT)
    return { empty, low, total: empty.length + low.length }
  }, [appState])

  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN
  // ═══════════════════════════════════════════════════════════════════════════
  const adminAddUser = useCallback(async () => {
    return { ok: false, error: 'Para agregar usuarios, el usuario debe registrarse directamente. Luego edita su rol desde este panel.' }
  }, [])

  const adminSaveUser = useCallback(async ({ id, name, role, status }) => {
    setAuthState(prev => ({
      users: prev.users.map(u => u.id === id ? { ...u, name: name || u.name, role, status } : u),
    }))
    await supabase.from('profiles').update({ name, role, status }).eq('id', id)
    closeModal()
  }, [closeModal])

  const toggleUserStatus = useCallback(async (id) => {
    setAuthState(prev => {
      const users = prev.users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u)
      const user  = users.find(u => u.id === id)
      if (user) supabase.from('profiles').update({ status: user.status }).eq('id', id)
      return { users }
    })
  }, [])

  const deleteUser = useCallback(async (id) => {
    const u = authState.users.find(x => x.id === id)
    if (!u || u.role === 'admin') return
    if (!window.confirm(`¿Eliminar al usuario "${u.name}"? No se puede deshacer.`)) return
    setAuthState(prev => ({ users: prev.users.filter(x => x.id !== id) }))
    supabase.from('profiles').update({ status: 'inactive' }).eq('id', id)
  }, [authState])

  const changeAdminPass = useCallback(async ({ pass1, pass2 }) => {
    if (pass1.length < 6) return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres.' }
    if (pass1 !== pass2)  return { ok: false, error: 'Las contraseñas no coinciden.' }
    const { error } = await supabase.auth.updateUser({ password: pass1 })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }, [])

  const clearNonAdmins = useCallback(async () => {
    if (!window.confirm('¿Eliminar todos los usuarios no administradores?')) return
    const ids = authState.users.filter(u => u.role !== 'admin').map(u => u.id)
    setAuthState(prev => ({ users: prev.users.filter(u => u.role === 'admin') }))
    for (const id of ids) supabase.from('profiles').update({ status: 'inactive' }).eq('id', id)
  }, [authState])

  // ── Valor del contexto ─────────────────────────────────────────────────────
  const value = {
    screen, setScreen,
    appPage, setAppPage,
    adminPage, setAdminPage,
    currentUser, subscription, authLoading, appLoading,
    appState, authState,
    modal, openModal, closeModal, modalData,
    // auth (delegado a AuthContext pero expuesto aquí para no romper componentes existentes)
    doLogin, doRegister, doLogout, upgradeToPro,
    // datos
    toggleHabit, addHabit, deleteHabit,
    addSaving, deleteSaving, openContribute, addContribution,
    selectDay, openMealEditor, saveMeals, saveDietPlan,
    addWorkout, toggleWorkoutDone, deleteWorkout,
    openInvAdd, openEditInv, saveInvProduct, deleteInvItem,
    openInvMove, saveInvMove, setInvFilter,
    getAlerts,
    // admin
    adminAddUser, adminSaveUser, toggleUserStatus, deleteUser,
    changeAdminPass, clearNonAdmins,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
