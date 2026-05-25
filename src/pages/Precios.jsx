import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import SubscribeButton from '../components/SubscribeButton'

const FEATURES_FREE = [
  'Hasta 3 hábitos',
  '1 meta de ahorro',
  'Planificador de comidas completo',
  'Rutinas de fitness ilimitadas',
  'Frase diaria de motivación',
  'Acceso desde cualquier dispositivo',
]

const FEATURES_PRO = [
  'Hábitos ilimitados',
  'Metas de ahorro ilimitadas',
  'Planificador de comidas completo',
  'Rutinas de fitness ilimitadas',
  'Inventario de cocina ilimitado',
  'Frase diaria de motivación',
  'Acceso desde cualquier dispositivo',
  'Soporte prioritario',
]

export default function Precios() {
  const { subscription, upgradeToPro } = useContext(AppContext)
  const isPro = subscription?.plan === 'pro'

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Planes</div>
          <div className="page-sub">
            {isPro
              ? 'Estás en el plan PRO — gracias por tu apoyo.'
              : 'Estás en el plan FREE. Actualiza para desbloquear todo.'}
          </div>
        </div>
        {isPro && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: '#fff', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
            <i className="ti ti-bolt" style={{ fontSize: 15 }}></i> Plan PRO activo
          </span>
        )}
      </div>

      {/* Tarjetas de plan */}
      <div data-tour="precios-plan" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, maxWidth: 680, marginBottom: 40 }}>

        {/* FREE */}
        <div className="card" style={{ border: subscription?.plan === 'free' ? '2px solid var(--accent)' : '1px solid var(--border)', position: 'relative' }}>
          {subscription?.plan === 'free' && (
            <div style={{ position: 'absolute', top: -11, left: 20, background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>
              TU PLAN ACTUAL
            </div>
          )}
          <div style={{ marginBottom: 4, fontWeight: 700, fontSize: 16 }}>FREE</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
            <span style={{ fontSize: 36, fontWeight: 800 }}>$0</span>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>/mes</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FEATURES_FREE.map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <i className="ti ti-check" style={{ color: 'var(--green)', fontSize: 15, flexShrink: 0 }}></i>
                {f}
              </li>
            ))}
          </ul>
          <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>Tu plan actual</div>
        </div>

        {/* PRO */}
        <div className="card" style={{ border: isPro ? '2px solid var(--accent)' : '1px solid var(--border)', position: 'relative', background: isPro ? 'var(--surface2)' : '' }}>
          {isPro && (
            <div style={{ position: 'absolute', top: -11, left: 20, background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>
              TU PLAN ACTUAL
            </div>
          )}
          {!isPro && (
            <div style={{ position: 'absolute', top: -11, right: 20, background: 'var(--green)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>
              RECOMENDADO
            </div>
          )}
          <div style={{ marginBottom: 4, fontWeight: 700, fontSize: 16 }}>PRO</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
            <span style={{ fontSize: 36, fontWeight: 800 }}>$50</span>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>MXN/mes</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FEATURES_PRO.map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <i className="ti ti-check" style={{ color: 'var(--green)', fontSize: 15, flexShrink: 0 }}></i>
                {f}
              </li>
            ))}
          </ul>
          {isPro ? (
            <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>Tu plan actual</div>
          ) : (
            <div data-tour="precios-subscribe">
              <SubscribeButton style={{ width: '100%' }} />
            </div>
          )}
        </div>
      </div>

      {/* FAQ de precios */}
      <div className="card" style={{ maxWidth: 680 }}>
        <div className="section-title-sm" style={{ marginBottom: 16 }}>Preguntas frecuentes</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { q: '¿Puedo cancelar en cualquier momento?', a: 'Sí. Si cancelas, tu cuenta vuelve al plan FREE al término del periodo pagado.' },
            { q: '¿Cómo se cobra el plan PRO?', a: 'El cobro es mensual. Actualmente el pago se procesa de forma manual — contáctanos al activarlo.' },
            { q: '¿Mis datos están seguros en PRO?', a: 'Igual que en FREE: tus datos se guardan en Supabase con cifrado en tránsito y en reposo.' },
            { q: '¿Qué pasa con mis datos si bajo de plan?', a: 'Tus datos no se eliminan. Si tienes más de 3 hábitos o más de 1 meta de ahorro, simplemente no podrás agregar más hasta que borres los que sobren.' },
          ].map(({ q, a }) => (
            <div key={q}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{q}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
