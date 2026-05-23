import { useState, useContext } from 'react'
import { AppContext } from '../context/AppContext'

export default function SubscribeButton({ label = 'Activar PRO — $50 MXN/mes', style }) {
  const { currentUser } = useContext(AppContext)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleClick = async () => {
    if (!currentUser?.id) {
      setError('Debes iniciar sesión primero.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/.netlify/functions/create-checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId: currentUser.id }),
      })

      const data = await res.json()

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'No se pudo iniciar el pago.')
      }

      // Redirige al usuario a Stripe Checkout
      window.location.href = data.url
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        className="btn btn-dark"
        onClick={handleClick}
        disabled={loading}
        style={{ minWidth: 220, justifyContent: 'center', ...style }}
      >
        {loading ? (
          <span style={{ opacity: .7 }}>Redirigiendo a Stripe...</span>
        ) : (
          <>
            <i className="ti ti-bolt" style={{ fontSize: 15 }}></i>
            {label}
          </>
        )}
      </button>
      {error && (
        <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>{error}</div>
      )}
    </div>
  )
}
