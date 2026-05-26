import { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import SubscribeButton from '../components/SubscribeButton'

const FREE_SAVING_LIMIT = 1

function SavingLimitModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: '#111', border: '1px solid rgba(0,212,255,.2)',
        borderRadius: 16, padding: 32, maxWidth: 400, width: '100%',
        boxShadow: '0 0 40px rgba(0,212,255,.08)',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: 'rgba(0,212,255,.1)', border: '1px solid rgba(0,212,255,.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, marginBottom: 20,
        }}>🔒</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#efefed', marginBottom: 10 }}>
          Límite de metas alcanzado
        </div>
        <div style={{ fontSize: 14, color: '#8a8a85', lineHeight: 1.7, marginBottom: 24 }}>
          El plan gratuito incluye hasta <strong style={{ color: '#efefed' }}>1 meta de ahorro</strong>.
          Actualiza a PRO para agregar metas ilimitadas y alcanzar tus objetivos financieros sin límites.
        </div>
        <SubscribeButton style={{ width: '100%', marginBottom: 10 }} />
        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '11px 0', border: '1px solid #2a2a2a',
            borderRadius: 8, background: 'transparent', color: '#8a8a85',
            fontSize: 14, fontWeight: 500, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}

export default function Ahorro() {
  const { appState, deleteSaving, openContribute, openModal, subscription } = useContext(AppContext)
  const [showLimitModal, setShowLimitModal] = useState(false)
  if (!appState) return null

  const isPro     = subscription?.plan === 'pro'
  const savCount  = appState.savings.length
  const atLimit   = !isPro && savCount >= FREE_SAVING_LIMIT

  const handleNewSaving = () => {
    if (atLimit) { setShowLimitModal(true); return }
    openModal('saving')
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Ahorro</div>
          <div className="page-sub">Tus metas financieras</div>
        </div>
        <button className="btn btn-dark" onClick={handleNewSaving}>
          <i className="ti ti-plus"></i>Nueva meta
          {atLimit && (
            <span style={{
              marginLeft: 8, fontSize: 9, fontWeight: 700,
              background: 'rgba(255,184,0,.15)', color: '#FFB800',
              border: '1px solid rgba(255,184,0,.35)',
              padding: '1px 6px', borderRadius: 20, letterSpacing: .5,
            }}>PRO</span>
          )}
        </button>
      </div>

      {appState.savings.length === 0 ? (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div className="section-title-sm">Mis metas</div>
            {isPro
              ? <span style={{ fontSize: 12, color: '#00D4FF', fontWeight: 500 }}>Metas ilimitadas ✓</span>
              : <span style={{ fontSize: 12, color: '#555' }}>{savCount} de {FREE_SAVING_LIMIT} metas — Plan FREE</span>
            }
          </div>
          <div className="empty">Sin metas. ¡Crea una!</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            {isPro
              ? <span style={{ fontSize: 12, color: '#00D4FF', fontWeight: 500 }}>Metas ilimitadas ✓</span>
              : <span style={{ fontSize: 12, color: '#555' }}>{savCount} de {FREE_SAVING_LIMIT} metas — Plan FREE</span>
            }
          </div>
          {appState.savings.map(s => {
            const pct = Math.min(100, Math.round(s.current / s.goal * 100))
            const barClass = pct >= 80 ? 'pb-green' : pct >= 40 ? 'pb-blue' : 'pb-amber'
            return (
              <div key={s.id} className="saving-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                      ${s.current.toLocaleString('es-MX')} de ${s.goal.toLocaleString('es-MX')}
                    </div>
                    {s.deadline && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>Límite: {s.deadline}</div>}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'DM Mono', color: 'var(--green)' }}>{pct}%</div>
                </div>
                <div className="pb-wrap" style={{ height: 8 }}>
                  <div className={`pb-fill ${barClass}`} style={{ width: `${pct}%` }}></div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn btn-green btn-sm" onClick={() => openContribute(s.id)}>
                    <i className="ti ti-plus" style={{ fontSize: 14 }}></i>Aportar
                  </button>
                  <button className="btn-icon" onClick={() => deleteSaving(s.id)} aria-label="Eliminar">
                    <i className="ti ti-trash"></i>
                  </button>
                </div>
              </div>
            )
          })}
        </>
      )}

      {showLimitModal && <SavingLimitModal onClose={() => setShowLimitModal(false)} />}
    </div>
  )
}
