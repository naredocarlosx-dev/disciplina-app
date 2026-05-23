import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const PLAN_LABEL  = { pro: 'PRO', free: 'Free' }
const PLAN_COLOR  = { pro: 'var(--accent)', free: 'var(--text3)' }
const STATUS_LABEL = { active: 'Activa', cancelled: 'Cancelada', trial: 'Trial' }
const STATUS_COLOR = { active: 'var(--green)', cancelled: 'var(--red)', trial: 'var(--amber)' }

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminSuscripciones() {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [{ data: subs }, { data: profiles }] = await Promise.all([
        supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, name, email'),
      ])

      const profileMap = {}
      for (const p of (profiles || [])) profileMap[p.id] = p

      setRows((subs || []).map(s => ({
        ...s,
        name:  profileMap[s.user_id]?.name  || '—',
        email: profileMap[s.user_id]?.email || '—',
      })))
      setLoading(false)
    }
    load()
  }, [])

  const filtered = rows.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                        r.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || r.plan === filter
    return matchSearch && matchFilter
  })

  const total = rows.length
  const pro   = rows.filter(r => r.plan === 'pro').length
  const free  = rows.filter(r => r.plan === 'free').length

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Suscripciones</div>
          <div className="page-sub">Usuarios registrados y estado de sus planes</div>
        </div>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 20 }}>
        <div className="metric-card accent-blue">
          <div className="metric-label">Total usuarios</div>
          <div className="metric-val c-blue">{total}</div>
        </div>
        <div className="metric-card" style={{ background: 'rgba(var(--accent-rgb),.08)', border: '1px solid rgba(var(--accent-rgb),.2)' }}>
          <div className="metric-label">Plan PRO</div>
          <div className="metric-val" style={{ color: 'var(--accent)' }}>{pro}</div>
        </div>
        <div className="metric-card accent-surface">
          <div className="metric-label">Plan Free</div>
          <div className="metric-val" style={{ color: 'var(--text3)' }}>{free}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text1)', fontSize: 13, cursor: 'pointer' }}
          >
            <option value="all">Todos los planes</option>
            <option value="pro">Solo PRO</option>
            <option value="free">Solo Free</option>
          </select>
          <span style={{ fontSize: 13, color: 'var(--text3)', marginLeft: 'auto' }}>{filtered.length} de {total}</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)', fontSize: 13 }}>
            <i className="ti ti-loader" style={{ fontSize: 20, display: 'block', marginBottom: 8 }}></i>
            Cargando suscripciones...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Estado</th>
                  <th>Fecha inicio</th>
                  <th>Renovación</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)', padding: '32px 0' }}>
                      No se encontraron resultados
                    </td>
                  </tr>
                ) : filtered.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                          background: r.plan === 'pro' ? 'rgba(var(--accent-rgb),.15)' : 'var(--surface3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700,
                          color: r.plan === 'pro' ? 'var(--accent)' : 'var(--text2)',
                        }}>
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500 }}>{r.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{r.email}</td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        background: r.plan === 'pro' ? 'rgba(var(--accent-rgb),.15)' : 'var(--surface3)',
                        color: PLAN_COLOR[r.plan] || 'var(--text2)',
                      }}>
                        {r.plan === 'pro' && <i className="ti ti-bolt" style={{ fontSize: 10 }}></i>}
                        {PLAN_LABEL[r.plan] || r.plan}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLOR[r.status] || 'var(--text3)', flexShrink: 0 }}></span>
                        {STATUS_LABEL[r.status] || r.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text3)', fontSize: 13 }}>{fmt(r.started_at)}</td>
                    <td style={{ color: 'var(--text3)', fontSize: 13 }}>{fmt(r.expires_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
