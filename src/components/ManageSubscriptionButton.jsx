import { useState, useContext } from 'react'
import { AppContext } from '../context/AppContext'

export default function ManageSubscriptionButton({ style }) {
  const { currentUser } = useContext(AppContext)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleClick = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/.netlify/functions/create-portal', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId: currentUser.id }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'No se pudo abrir el portal.')
      window.location.href = data.url
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div style={style}>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
          background: 'transparent', border: '1px solid rgba(255,255,255,.15)',
          color: '#efefed', fontSize: 13, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          opacity: loading ? .6 : 1, transition: 'border-color .2s, background .2s',
          width: '100%', justifyContent: 'center',
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = 'rgba(0,212,255,.4)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)' }}
      >
        <i className="ti ti-credit-card" style={{ fontSize: 15 }}></i>
        {loading ? 'Abriendo portal...' : 'Gestionar suscripción'}
      </button>
      {error && (
        <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 6, textAlign: 'center' }}>
          {error}
        </div>
      )}
    </div>
  )
}
