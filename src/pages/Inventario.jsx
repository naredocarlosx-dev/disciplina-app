import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { CAT_LABELS, CAT_ICONS, ALERT_PCT, fq } from '../constants'

export default function Inventario() {
  const { appState, deleteInvItem, openInvAdd, openEditInv, openInvMove, setInvFilter, getAlerts } = useContext(AppContext)
  if (!appState) return null

  const alerts = getAlerts()
  const totalProducts = appState.inventory.length
  const lowCount = appState.inventory.filter(p => p.qty > 0 && (p.qty / p.max * 100) <= 20).length
  const emptyCount = appState.inventory.filter(p => p.qty <= 0).length

  const cats = ['todos', ...[...new Set(appState.inventory.map(p => p.cat))]]
  const filtered = appState.invFilter === 'todos' ? appState.inventory : appState.inventory.filter(p => p.cat === appState.invFilter)
  const sorted = [...filtered].sort((a, b) => (a.qty / a.max) - (b.qty / b.max))
  const recentLog = [...appState.invLog].reverse().slice(0, 8)

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Inventario de cocina</div>
          <div className="page-sub">Controla tu despensa en tiempo real</div>
        </div>
        <button className="btn btn-dark" onClick={openInvAdd}>
          <i className="ti ti-plus"></i>Agregar producto
        </button>
      </div>

      {/* Alerts */}
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

      {/* Metrics */}
      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="metric-card accent-blue"><div className="metric-label">Total productos</div><div className="metric-val c-blue">{totalProducts}</div></div>
        <div className="metric-card accent-amber"><div className="metric-label">Stock bajo</div><div className="metric-val c-amber">{lowCount}</div></div>
        <div className="metric-card accent-red"><div className="metric-label">Agotados</div><div className="metric-val c-red">{emptyCount}</div></div>
      </div>

      <div className="card">
        <div className="section-row"><div className="section-title-sm">Productos</div></div>
        <div className="filter-bar">
          {cats.map(c => (
            <button
              key={c}
              className={`filter-btn${appState.invFilter === c ? ' active' : ''}`}
              onClick={() => setInvFilter(c)}
            >
              {c === 'todos' ? 'Todos' : CAT_LABELS[c] || c}
            </button>
          ))}
        </div>
        {sorted.length === 0 ? (
          <div className="empty">Sin productos en esta categoría.</div>
        ) : (
          sorted.map(p => {
            const pct = Math.min(100, Math.round(p.qty / p.max * 100))
            const isEmpty = p.qty <= 0
            const isCrit = !isEmpty && pct <= ALERT_PCT
            const isLow = !isEmpty && !isCrit && pct <= 20
            const barClass = isEmpty ? 'pb-red' : isCrit ? 'pb-orange' : isLow ? 'pb-amber' : pct <= 50 ? 'pb-blue' : 'pb-green'
            const pctColor = isEmpty ? 'var(--red)' : isCrit ? 'var(--orange)' : isLow ? 'var(--amber)' : 'var(--green)'
            return (
              <div key={p.id} className="inv-row">
                <div className="inv-icon"><i className={`ti ti-${CAT_ICONS[p.cat] || 'package'}`}></i></div>
                <div className="inv-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className="inv-name">{p.name}</span>
                    {isEmpty && <span className="critical-badge cb-empty">Agotado</span>}
                    {isCrit && <span className="critical-badge cb-low">Crítico &lt;3%</span>}
                    <span className={`cat-badge cat-${p.cat}`}>{CAT_LABELS[p.cat]}</span>
                  </div>
                  <div className="inv-meta">{fq(p.qty)} / {fq(p.max)} {p.unit}</div>
                  <div className="pb-wrap" style={{ height: 5, marginTop: 6 }}>
                    <div className={`pb-fill ${barClass}`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="inv-pct" style={{ color: pctColor }}>{pct}%</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 6, justifyContent: 'flex-end' }}>
                    <button className="btn-icon" onClick={() => openInvMove(p.id)} aria-label="Movimiento"><i className="ti ti-transfer"></i></button>
                    <button className="btn-icon" onClick={() => openEditInv(p.id)} aria-label="Editar"><i className="ti ti-edit"></i></button>
                    <button className="btn-icon" onClick={() => deleteInvItem(p.id)} aria-label="Eliminar"><i className="ti ti-trash"></i></button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="card">
        <div className="card-title"><i className="ti ti-history"></i>Últimos movimientos</div>
        {recentLog.length === 0 ? (
          <div className="empty">Sin movimientos aún.</div>
        ) : (
          recentLog.map(l => (
            <div key={l.id} className="log-row">
              <div className={`log-icon ${l.type === 'buy' ? 'buy' : 'use'}`}>
                <i className={`ti ti-${l.type === 'buy' ? 'arrow-down' : 'arrow-up'}`}></i>
              </div>
              <div style={{ flex: 1 }}>
                <div className="log-name">
                  {l.name} <span style={{ color: l.type === 'buy' ? 'var(--green)' : 'var(--amber)' }}>
                    {l.type === 'buy' ? '+' : '-'}{fq(l.qty)} {l.unit}
                  </span>
                </div>
                {l.note && <div className="log-detail">{l.note}</div>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>{l.date}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
