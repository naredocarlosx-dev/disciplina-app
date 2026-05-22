import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

export default function Ahorro() {
  const { appState, deleteSaving, openContribute, openModal } = useContext(AppContext)
  if (!appState) return null

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Ahorro</div>
          <div className="page-sub">Tus metas financieras</div>
        </div>
        <button className="btn btn-dark" onClick={() => openModal('saving')}>
          <i className="ti ti-plus"></i>Nueva meta
        </button>
      </div>

      {appState.savings.length === 0 ? (
        <div className="card"><div className="empty">Sin metas. ¡Crea una!</div></div>
      ) : (
        appState.savings.map(s => {
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
        })
      )}
    </div>
  )
}
