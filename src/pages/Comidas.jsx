import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { DAYS, MEAL_SLOTS } from '../constants'

function getWeekDays() {
  const today = new Date()
  const days = []
  const dow = today.getDay()
  const start = new Date(today)
  start.setDate(today.getDate() - dow)
  for (let i = 0; i < 7; i++) {
    const dd = new Date(start)
    dd.setDate(start.getDate() + i)
    days.push(dd)
  }
  return days
}

const weekDays = getWeekDays()

export default function Comidas() {
  const { appState, selectDay, openMealEditor, openModal } = useContext(AppContext)
  if (!appState) return null

  const today = new Date()
  const dm = appState.meals[appState.selectedDay] || {}

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Planificador de comidas</div>
          <div className="page-sub">Tu alimentación semanal</div>
        </div>
      </div>

      <div className="card">
        <div className="section-row">
          <div className="section-title-sm">
            {DAYS[appState.selectedDay]}{appState.selectedDay === today.getDay() ? ' — Hoy' : ''}
          </div>
          <button className="btn btn-outline btn-sm" onClick={openMealEditor}>
            <i className="ti ti-edit"></i>Editar día
          </button>
        </div>
        <div className="day-tabs">
          {weekDays.map(d => (
            <button
              key={d.getDay()}
              className={`day-tab${d.getDay() === appState.selectedDay ? ' active' : ''}`}
              onClick={() => selectDay(d.getDay())}
            >
              {DAYS[d.getDay()]} {d.getDate()}
            </button>
          ))}
        </div>
        <div>
          {MEAL_SLOTS.map(sl => {
            const m = dm[sl.key] || {}
            return (
              <div key={sl.key} className="meal-slot-row">
                <div className="meal-dot" style={{ background: sl.color }}></div>
                <div className="meal-slot-label">{sl.label}</div>
                <div className="meal-slot-food">
                  {m.food || <span style={{ color: 'var(--text3)' }}>Sin planificar</span>}
                </div>
                {m.time && (
                  <span className="meal-slot-time">
                    <i className="ti ti-clock" style={{ fontSize: 12, verticalAlign: '-1px' }}></i> {m.time}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="card">
        <div className="section-row">
          <div className="section-title-sm">Plan de dieta</div>
          <button className="btn btn-outline btn-sm" onClick={() => openModal('diet')}>
            <i className="ti ti-settings"></i>Configurar
          </button>
        </div>
        {!appState.dietPlan ? (
          <div className="empty">Sin plan configurado.</div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{appState.dietPlan.name}</div>
              {appState.dietPlan.desc && (
                <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6, lineHeight: 1.6 }}>{appState.dietPlan.desc}</div>
              )}
            </div>
            <button className="btn-icon" onClick={() => openModal('diet')} aria-label="Editar">
              <i className="ti ti-edit"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
