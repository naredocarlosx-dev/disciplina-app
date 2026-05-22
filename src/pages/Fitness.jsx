import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { todayKey } from '../constants'

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DAY_MAP = { L: 1, M: 2, X: 3, J: 4, V: 5, S: 6, D: 0 }
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

export default function Fitness() {
  const { appState, toggleWorkoutDone, deleteWorkout, openModal } = useContext(AppContext)
  if (!appState) return null

  const today = new Date()

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Fitness</div>
          <div className="page-sub">Tus rutinas de entrenamiento</div>
        </div>
        <button className="btn btn-dark" onClick={() => openModal('workout')}>
          <i className="ti ti-plus"></i>Nueva rutina
        </button>
      </div>

      <div className="card">
        <div className="section-row"><div className="section-title-sm">Rutinas</div></div>
        {appState.workouts.length === 0 ? (
          <div className="empty">Sin rutinas. ¡Crea una!</div>
        ) : (
          appState.workouts.map(w => {
            const isDone = w.done.includes(todayKey)
            return (
              <div key={w.id} className="workout-row" style={{ borderLeft: `3px solid ${w.color}` }}>
                <div className="w-dot" style={{ background: w.color }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{w.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{w.days.join(' · ')}</div>
                </div>
                <div
                  className={`check-box${isDone ? ' done' : ''}`}
                  onClick={() => toggleWorkoutDone(w.id)}
                  style={{ width: 28, height: 28 }}
                >
                  {isDone && <i className="ti ti-check"></i>}
                </div>
                <button className="btn-icon" onClick={() => deleteWorkout(w.id)} aria-label="Eliminar">
                  <i className="ti ti-trash"></i>
                </button>
              </div>
            )
          })
        )}
      </div>

      <div className="card">
        <div className="card-title"><i className="ti ti-calendar-week"></i>Vista semanal</div>
        <div className="week-grid">
          {WEEK_ORDER.map(di => {
            const workoutsThisDay = appState.workouts.filter(w => w.days.some(d => DAY_MAP[d] === di))
            const isToday = di === today.getDay()
            return (
              <div key={di} className={`week-cell${isToday ? ' today' : ''}`}>
                <div className="week-cell-day">{DAY_NAMES[di]}</div>
                {workoutsThisDay.length > 0 ? (
                  workoutsThisDay.map(w => (
                    <div key={w.id} className="week-pill" style={{ background: `${w.color}22`, color: w.color }}>{w.name}</div>
                  ))
                ) : (
                  <div style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'center' }}>—</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
