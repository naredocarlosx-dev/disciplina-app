import { useContext, useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider, AppContext } from './context/AppContext'
import Landing              from './pages/Landing'
import AuthScreen           from './screens/AuthScreen'
import AppScreen            from './screens/AppScreen'
import AdminScreen          from './screens/AdminScreen'
import ResetPasswordScreen  from './screens/ResetPasswordScreen'
import OnboardingScreen     from './screens/OnboardingScreen'
import TrialExpiredScreen   from './screens/TrialExpiredScreen'

function LoadingScreen() {
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 8000)
    return () => clearTimeout(t)
  }, [])

  if (timedOut) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16, padding: 24 }}>
        <span style={{ fontSize: 14, color: 'var(--text3)', textAlign: 'center' }}>Algo salió mal</span>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: '12px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}
        >
          Toca para recargar
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }}></div>
      <span style={{ fontSize: 14, color: 'var(--text3)' }}>Cargando...</span>
    </div>
  )
}

function Router() {
  const { screen, saveError } = useContext(AppContext)
  const { resetPasswordMode } = useAuth()

  // El usuario llegó desde el link del correo de recuperación
  if (resetPasswordMode) return <ResetPasswordScreen />
  if (screen === 'loading')  return <LoadingScreen />

  return (
    <>
      {screen === 'landing' && <Landing />}
      {screen === 'auth'    && <AuthScreen />}
      {screen === 'app'           && <AppScreen />}
      {screen === 'onboarding'    && <OnboardingScreen />}
      {screen === 'admin'         && <AdminScreen />}
      {screen === 'trial-expired' && <TrialExpiredScreen />}
      {saveError && (
        <div style={{
          position: 'fixed', bottom: 88, left: 16, right: 16, zIndex: 9999,
          background: '#dc2626', color: '#fff', padding: '12px 16px',
          borderRadius: 10, fontSize: 13, textAlign: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          pointerEvents: 'none',
        }}>
          {saveError}
        </div>
      )}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router />
      </AppProvider>
    </AuthProvider>
  )
}
