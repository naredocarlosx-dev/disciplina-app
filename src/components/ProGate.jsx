import { Lock } from 'lucide-react'
import SubscribeButton from './SubscribeButton'

export default function ProGate({ title, description }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center',
      padding: '80px 24px', minHeight: '60vh',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'rgba(0,212,255,.08)', border: '1px solid rgba(0,212,255,.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24, boxShadow: '0 0 28px rgba(0,212,255,.12)',
      }}>
        <Lock size={30} color="#00D4FF" strokeWidth={1.8} />
      </div>

      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 2,
        textTransform: 'uppercase', color: '#FFB800',
        background: 'rgba(255,184,0,.1)', border: '1px solid rgba(255,184,0,.3)',
        padding: '3px 10px', borderRadius: 20, marginBottom: 18,
        display: 'inline-block',
      }}>
        Función PRO
      </span>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14, color: '#efefed', letterSpacing: '-.3px' }}>
        {title}
      </h2>
      <p style={{ fontSize: 15, color: '#8a8a85', lineHeight: 1.75, maxWidth: 460, marginBottom: 32 }}>
        {description}
      </p>

      <SubscribeButton />
    </div>
  )
}
