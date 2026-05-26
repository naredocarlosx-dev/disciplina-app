import { useContext, useRef, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { DAYS, MEAL_SLOTS, BT_QUOTES, CAT_ICONS, todayKey, fq } from '../constants'
import { Chart, CategoryScale, LinearScale, BarElement, BarController, Tooltip } from 'chart.js'

Chart.register(CategoryScale, LinearScale, BarElement, BarController, Tooltip)

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días 👋'
  if (h < 18) return 'Buenas tardes 👋'
  return 'Buenas noches 👋'
}

function getDateStr() {
  const today = new Date()
  const ds = today.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return ds.charAt(0).toUpperCase() + ds.slice(1)
}

function getDayOfYear() {
  const today = new Date()
  return Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000)
}

function PlanBanner({ currentUser, subscription, setAppPage }) {
  const isPro      = subscription?.plan === 'pro'
  const daysLeft   = currentUser?.trialDaysLeft ?? 0
  const endDate    = currentUser?.trialEndDate
  const trialTotal = 90
  const daysUsed   = endDate
    ? Math.max(0, trialTotal - daysLeft)
    : trialTotal
  const pct = Math.min(100, Math.round(daysUsed / trialTotal * 100))

  // PRO activo
  if (isPro) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(0,212,255,.06)', border: '1px solid rgba(0,212,255,.18)',
        borderRadius: 12, padding: '12px 16px', marginBottom: 20,
      }}>
        <span style={{ fontSize: 20 }}>⚡</span>
        <div style={{ flex: 1, fontSize: 13, color: '#8a8a85' }}>
          Estás en el <strong style={{ color: '#00D4FF' }}>Plan PRO</strong> — acceso completo a todas las funciones.
        </div>
      </div>
    )
  }

  // Sin trial asignado
  if (!endDate) return null

  // Colores según urgencia
  const isUrgent   = daysLeft <= 3
  const isWarning  = daysLeft <= 7 && daysLeft > 3
  const accent     = isUrgent ? '#e05555' : isWarning ? '#FFB800' : '#00D4FF'
  const bgAlpha    = isUrgent ? 'rgba(224,85,85,.06)' : isWarning ? 'rgba(255,184,0,.06)' : 'rgba(0,212,255,.06)'
  const borderAlpha = isUrgent ? 'rgba(224,85,85,.25)' : isWarning ? 'rgba(255,184,0,.25)' : 'rgba(0,212,255,.18)'
  const icon       = isUrgent ? '🚨' : isWarning ? '⏳' : '🎯'

  const endFormatted = new Date(endDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })

  return (
    <div style={{
      background: bgAlpha, border: `1px solid ${borderAlpha}`,
      borderRadius: 12, padding: '14px 16px', marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>
              {daysLeft === 0 ? 'Tu prueba ha expirado' : `${daysLeft} día${daysLeft !== 1 ? 's' : ''} de prueba restantes`}
            </span>
            <span style={{ fontSize: 12, color: '#555', marginLeft: 8 }}>
              {daysLeft > 0 ? `· Vence el ${endFormatted}` : ''}
            </span>
          </div>
        </div>
        <button
          onClick={() => setAppPage('precios')}
          style={{
            fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, cursor: 'pointer',
            background: accent, color: isUrgent || isWarning ? '#000' : '#000',
            border: 'none', fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
          }}
        >
          Activar PRO
        </button>
      </div>
      {/* Progress bar */}
      <div style={{ height: 4, background: 'rgba(255,255,255,.07)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: `linear-gradient(90deg, ${accent}, ${accent}88)`,
          borderRadius: 4, transition: 'width .4s',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: '#555' }}>Día 1</span>
        <span style={{ fontSize: 10, color: '#555' }}>90 días</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { appState, toggleHabit, toggleWorkoutDone, getAlerts, currentUser, subscription, setAppPage } = useContext(AppContext)
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)

  // All hooks MUST be called before any conditional return
  useEffect(() => {
    if (!appState || !chartRef.current) return
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
      chartInstanceRef.current = null
    }
    const now = new Date()
    const last7 = []
    const labels = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const k = d.toISOString().split('T')[0]
      last7.push(appState.progressHistory[k] || 0)
      labels.push(DAYS[d.getDay()])
    }
    chartInstanceRef.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: '%',
          data: last7,
          backgroundColor: last7.map((_, i) => i === 6 ? '#1D9E75' : '#9FE1CB'),
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: c => c.parsed.y + '%' } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'DM Mono', size: 11 }, color: '#A8A89F' } },
          y: { min: 0, max: 100, grid: { color: 'rgba(0,0,0,.05)' }, ticks: { font: { family: 'DM Mono', size: 11 }, color: '#A8A89F', callback: v => v + '%' }, border: { display: false } }
        }
      }
    })
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
        chartInstanceRef.current = null
      }
    }
  }, [appState?.progressHistory, appState?.habits])

  if (!appState) return null

  const today = new Date()
  const done = appState.habits.filter(h => h.doneToday).length
  const total = appState.habits.length
  const pct = total ? Math.round(done / total * 100) : 0
  const maxStreak = appState.habits.reduce((m, h) => Math.max(m, h.streak), 0)
  const alerts = getAlerts()
  const todayDayCode = ['D', 'L', 'M', 'X', 'J', 'V', 'S'][today.getDay()]
  const todayWorkouts = appState.workouts.filter(w => w.days.includes(todayDayCode))
  const todayMeals = appState.meals[today.getDay()] || {}
  const filledMeals = MEAL_SLOTS.filter(sl => todayMeals[sl.key] && todayMeals[sl.key].food)
  const dy = getDayOfYear()
  const quote = BT_QUOTES[dy % BT_QUOTES.length]
  const btDateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div>
      <div className="topbar" data-tour="dash-greeting">
        <div>
          <div className="topbar-greeting">{getGreeting()}</div>
          <div className="topbar-date">{getDateStr()}</div>
        </div>
        <div className="today-pill">Hoy</div>
      </div>

      <PlanBanner currentUser={currentUser} subscription={subscription} setAppPage={setAppPage} />

      <div className="quote-card">
        <div className="quote-accent"></div>
        <div className="quote-mark" aria-hidden="true">"</div>
        <p className="quote-text">{quote}</p>
        <div className="quote-footer">
          <div className="quote-date-pill">
            <i className="ti ti-calendar" style={{ fontSize: 12 }}></i>
            <span>{btDateStr}</span>
          </div>
        </div>
      </div>

      {alerts.empty.length > 0 && (
        <div className="alert-banner alert-empty">
          <i className="ti ti-alert-circle"></i>
          <div className="alert-body">
            <div className="alert-title">Productos agotados ({alerts.empty.length})</div>
            <div className="alert-sub">{alerts.empty.map(p => p.name).join(', ')}</div>
          </div>
        </div>
      )}
      {alerts.low.length > 0 && (
        <div className="alert-banner alert-low">
          <i className="ti ti-alert-triangle"></i>
          <div className="alert-body">
            <div className="alert-title">Stock crítico — menos del 3% ({alerts.low.length})</div>
            <div className="alert-sub">{alerts.low.map(p => `${p.name}: ${fq(p.qty)} ${p.unit}`).join(' · ')}</div>
          </div>
        </div>
      )}

      <div className="metric-grid">
        <div className="metric-card accent-green" data-tour="dash-completed"><div className="metric-label">Completados hoy</div><div className="metric-val c-green">{done}/{total}</div></div>
        <div className="metric-card accent-amber" data-tour="dash-streak"><div className="metric-label">Racha máxima</div><div className="metric-val c-amber">{maxStreak} 🔥</div></div>
        <div className="metric-card accent-blue" data-tour="dash-progress"><div className="metric-label">Progreso del día</div><div className="metric-val c-blue">{pct}%</div></div>
        <div className="metric-card accent-red"><div className="metric-label">Alertas cocina</div><div className="metric-val c-red">{alerts.total}</div></div>
      </div>

      <div className="dash-grid">
        <div className="dash-col">
          <div className="card" data-tour="dash-chart">
            <div className="card-title"><i className="ti ti-chart-bar"></i>Progreso semanal</div>
            <div className="chart-wrap"><canvas ref={chartRef}></canvas></div>
          </div>
          <div className="card">
            <div className="section-row"><div className="section-title-sm">Hábitos de hoy</div></div>
            {appState.habits.length === 0 ? (
              <div className="empty">Sin hábitos aún.</div>
            ) : (
              appState.habits.map(h => (
                <div key={h.id} className="habit-row">
                  <div className={`check-box${h.doneToday ? ' done' : ''}`} onClick={() => toggleHabit(h.id)}>
                    {h.doneToday && <i className="ti ti-check"></i>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="habit-name" style={h.doneToday ? { textDecoration: 'line-through', color: 'var(--text3)' } : {}}>{h.name}</div>
                  </div>
                  <span className="streak-pill">🔥 {h.streak}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="dash-col">
          <div className="card">
            <div className="card-title"><i className="ti ti-salad"></i>Comidas de hoy</div>
            {filledMeals.length === 0 ? (
              <div className="empty" style={{ padding: 10 }}>Sin comidas planificadas.</div>
            ) : (
              filledMeals.map(sl => (
                <div key={sl.key} className="meal-slot-row">
                  <div className="meal-dot" style={{ background: sl.color }}></div>
                  <div className="meal-slot-label">{sl.label}</div>
                  <div className="meal-slot-food">{todayMeals[sl.key].food}</div>
                  {todayMeals[sl.key].time && <span className="meal-slot-time">{todayMeals[sl.key].time}</span>}
                </div>
              ))
            )}
          </div>
          <div className="card">
            <div className="card-title"><i className="ti ti-barbell"></i>Entrenamiento de hoy</div>
            {todayWorkouts.length === 0 ? (
              <div className="empty" style={{ padding: 10 }}>Descanso hoy 🛌</div>
            ) : (
              todayWorkouts.map(w => {
                const isDone = w.done.includes(todayKey)
                return (
                  <div key={w.id} className="workout-row" style={{ borderLeft: `3px solid ${w.color}` }}>
                    <div className="w-dot" style={{ background: w.color }}></div>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{w.name}</div>
                    <div className={`check-box${isDone ? ' done' : ''}`} onClick={() => toggleWorkoutDone(w.id)} style={{ width: 26, height: 26 }}>
                      {isDone && <i className="ti ti-check"></i>}
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <div className="card">
            <div className="card-title"><i className="ti ti-alert-triangle"></i>Stock crítico</div>
            {alerts.total === 0 ? (
              <div className="empty" style={{ padding: 12 }}>Todo en orden ✓</div>
            ) : (
              [...alerts.empty, ...alerts.low].map(p => {
                const pctVal = Math.round(p.qty / p.max * 100)
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <i className={`ti ti-${CAT_ICONS[p.cat] || 'package'}`} style={{ fontSize: 16, color: 'var(--text3)' }}></i>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                    <span className={`critical-badge ${p.qty <= 0 ? 'cb-empty' : 'cb-low'}`}>{p.qty <= 0 ? 'Agotado' : pctVal + '%'}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
