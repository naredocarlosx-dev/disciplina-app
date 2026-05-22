import { useContext } from 'react'
import { AuthProvider } from './context/AuthContext'
import { AppProvider, AppContext } from './context/AppContext'
import LandingScreen from './screens/LandingScreen'
import AuthScreen    from './screens/AuthScreen'
import AppScreen     from './screens/AppScreen'
import AdminScreen   from './screens/AdminScreen'

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }}></div>
      <span style={{ fontSize: 14, color: 'var(--text3)' }}>Cargando...</span>
    </div>
  )
}

function Router() {
  const { screen } = useContext(AppContext)
  if (screen === 'loading') return <LoadingScreen />
  return (
    <>
      {screen === 'landing' && <LandingScreen />}
      {screen === 'auth'    && <AuthScreen />}
      {screen === 'app'     && <AppScreen />}
      {screen === 'admin'   && <AdminScreen />}
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
