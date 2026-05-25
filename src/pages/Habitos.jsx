import { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import SubscribeButton from '../components/SubscribeButton'

const FREE_HABIT_LIMIT = 3

function HabitLimitModal({ onClose }) {
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
        {/* Lock icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: 'rgba(0,212,255,.1)', border: '1px solid rgba(0,212,255,.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, marginBottom: 20,
        }}>🔒</div>

        <div style={{ fontSize: 18, fontWeight: 700, color: '#efefed', marginBottom: 10 }}>
          Límite de hábitos alcanzado
        </div>
        <div style={{ fontSize: 14, color: '#8a8a85', lineHeight: 1.7, marginBottom: 24 }}>
          El plan gratuito incluye hasta <strong style={{ color: '#efefed' }}>3 hábitos</strong>.
          Actualiza a PRO para agregar hábitos ilimitados y llevar tu disciplina al siguiente nivel.
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

export default function Habitos() {
  const { appState, toggleHabit, deleteHabit, openModal, subscription } = useContext(AppContext)
  const [showLimitModal, setShowLimitModal] = useState(false)
  if (!appState) return null

  const isPro      = subscription?.plan === 'pro'
  const habitCount = appState.habits.length
  const atLimit    = !isPro && habitCount >= FREE_HABIT_LIMIT

  const handleNewHabit = () => {
    if (atLimit) { setShowLimitModal(true); return }
    openModal('habit')
  }

  const tagColor = (cat) => {
    if (cat === 'fitness') return 'tag-blue'
    if (cat === 'ahorro') return 'tag-amber'
    return 'tag-green'
  }

  const sorted = [...appState.habits].sort((a, b) => b.streak - a.streak).slice(0, 5)

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Hábitos</div>
          <div className="page-sub">Construye consistencia día a día</div>
        </div>
        <button
          className="btn btn-dark"
          onClick={handleNewHabit}
          data-tour="habits-add"
          style={{ position: 'relative' }}
        >
          <i className="ti ti-plus"></i>Nuevo hábito
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

      <div className="card" data-tour="habits-list">
        <div className="section-row">
          <div className="section-title-sm">Mis hábitos</div>
          {isPro ? (
            <span style={{ fontSize: 12, color: '#00D4FF', fontWeight: 500 }}>
              Hábitos ilimitados ✓
            </span>
          ) : (
            <span style={{ fontSize: 12, color: '#555' }}>
              {habitCount} de {FREE_HABIT_LIMIT} hábitos — Plan FREE
            </span>
          )}
        </div>
        {habitCount === 0 ? (
          <div className="empty">No hay hábitos. ¡Crea uno!</div>
        ) : (
          appState.habits.map(h => (
            <div key={h.id} className="habit-row">
              <div className={`check-box${h.doneToday ? ' done' : ''}`} onClick={() => toggleHabit(h.id)}>
                {h.doneToday && <i className="ti ti-check"></i>}
              </div>
              <div style={{ flex: 1 }}>
                <div className="habit-name" style={h.doneToday ? { textDecoration: 'line-through', color: 'var(--text3)' } : {}}>{h.name}</div>
                <div className="habit-meta"><span className={`tag ${tagColor(h.cat)}`}>{h.cat}</span></div>
              </div>
              <span className="streak-pill">🔥 {h.streak} días</span>
              <button className="btn-icon" onClick={() => deleteHabit(h.id)} aria-label="Eliminar">
                <i className="ti ti-trash"></i>
              </button>
            </div>
          ))
        )}
      </div>

      <div className="card" data-tour="habits-streak">
        <div className="card-title"><i className="ti ti-flame"></i>Rachas activas</div>
        {sorted.length === 0 ? (
          <div className="empty">Sin rachas aún.</div>
        ) : (
          sorted.map(h => (
            <div key={h.id} className="habit-row">
              <div style={{ fontSize: 22 }}>🔥</div>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{h.name}</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'DM Mono', color: 'var(--amber)' }}>{h.streak}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>días</div>
            </div>
          ))
        )}
      </div>

      {showLimitModal && <HabitLimitModal onClose={() => setShowLimitModal(false)} />}
    </div>
  )
}
