import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

export default function Habitos() {
  const { appState, toggleHabit, deleteHabit, openModal } = useContext(AppContext)
  if (!appState) return null

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
        <button className="btn btn-dark" onClick={() => openModal('habit')} data-tour="habits-add">
          <i className="ti ti-plus"></i>Nuevo hábito
        </button>
      </div>

      <div className="card" data-tour="habits-list">
        <div className="section-row"><div className="section-title-sm">Mis hábitos</div></div>
        {appState.habits.length === 0 ? (
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
    </div>
  )
}
