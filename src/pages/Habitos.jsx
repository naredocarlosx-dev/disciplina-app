import { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import SubscribeButton from '../components/SubscribeButton'

// ── Historial helpers ──────────────────────────────────────────────────────
function getLast30Days() {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

const DAYS_30 = getLast30Days()
const TODAY   = new Date().toISOString().split('T')[0]

const SHORT_MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function HabitCalendar({ habit }) {
  const [hovered, setHovered] = useState(null)
  const completedCount = DAYS_30.filter(d => habit.history?.[d]).length
  const rate = Math.round(completedCount / 30 * 100)

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Habit name + rate */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#efefed' }}>{habit.name}</div>
        <div style={{ fontSize: 11, color: '#555' }}>
          <span style={{ color: rate >= 70 ? '#00D4FF' : rate >= 40 ? '#FFB800' : '#555', fontWeight: 600 }}>
            {completedCount}/30
          </span>
          {' '}días
        </div>
      </div>

      {/* Dot grid */}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'nowrap', overflowX: 'auto' }}>
          {DAYS_30.map((date, i) => {
            const done    = habit.history?.[date] === true
            const isToday = date === TODAY
            const month   = parseInt(date.split('-')[1], 10) - 1
            const day     = parseInt(date.split('-')[2], 10)
            const showLabel = day === 1 || i === 0

            return (
              <div key={date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                {showLabel && (
                  <span style={{ fontSize: 9, color: '#444', whiteSpace: 'nowrap', height: 12, lineHeight: '12px' }}>
                    {SHORT_MONTHS[month]}
                  </span>
                )}
                {!showLabel && <span style={{ height: 12 }} />}
                <div
                  onMouseEnter={() => setHovered(date)}
                  onMouseLeave={() => setHovered(null)}
                  title={`${date}: ${done ? 'Completado ✓' : 'No completado'}`}
                  style={{
                    width: 12, height: 12, borderRadius: 3, cursor: 'default', flexShrink: 0,
                    background: done ? '#00D4FF' : 'rgba(255,255,255,.07)',
                    border: isToday ? '1px solid rgba(0,212,255,.6)' : '1px solid transparent',
                    boxShadow: done ? '0 0 4px rgba(0,212,255,.4)' : 'none',
                    transition: 'transform .1s',
                    transform: hovered === date ? 'scale(1.4)' : 'scale(1)',
                  }}
                />
              </div>
            )
          })}
        </div>

        {/* Tooltip */}
        {hovered && (
          <div style={{
            position: 'absolute', bottom: 'calc(100% + 6px)',
            left: `${DAYS_30.indexOf(hovered) * 15}px`,
            background: '#1a1a1a', border: '1px solid rgba(0,212,255,.2)',
            borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#efefed',
            whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 10,
          }}>
            {hovered} — {habit.history?.[hovered] ? '✓ Completado' : '✗ No completado'}
          </div>
        )}
      </div>
    </div>
  )
}

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

      {/* Historial 30 días */}
      {appState.habits.length > 0 && (
        <div className="card">
          <div className="section-row" style={{ marginBottom: 16 }}>
            <div className="section-title-sm">Historial</div>
            <span style={{ fontSize: 11, color: '#444' }}>Últimos 30 días</span>
          </div>

          {appState.habits.map(h => <HabitCalendar key={h.id} habit={h} />)}

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#00D4FF', boxShadow: '0 0 4px rgba(0,212,255,.4)' }} />
              <span style={{ fontSize: 11, color: '#555' }}>Completado</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(255,255,255,.07)' }} />
              <span style={{ fontSize: 11, color: '#555' }}>No completado</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, border: '1px solid rgba(0,212,255,.6)' }} />
              <span style={{ fontSize: 11, color: '#555' }}>Hoy</span>
            </div>
          </div>
        </div>
      )}

      {showLimitModal && <HabitLimitModal onClose={() => setShowLimitModal(false)} />}
    </div>
  )
}
