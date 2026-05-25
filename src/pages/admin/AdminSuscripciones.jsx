import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getType(row) {
  if (!row.plan || row.plan === 'free') return { label: '—',      color: 'var(--text3)' }
  if (row.stripe_customer_id)           return { label: 'Stripe', color: 'var(--blue)'  }
  if (row.expires_at)                   return { label: 'Promo',  color: 'var(--amber)' }
  return                                       { label: 'Manual', color: 'var(--purple)'}
}

function isExpiringSoon(expires_at) {
  if (!expires_at) return false
  const days = (new Date(expires_at) - new Date()) / 86400000
  return days >= 0 && days <= 7
}

export default function AdminSuscripciones() {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')
  const [actioning, setActioning] = useState(null)   // userId being processed
  const [promoPos,  setPromoPos]  = useState(null)   // { top, left, userId, email, name }
  const [toast, setToast] = useState(null)           // { text, ok }

  const load = async () => {
    setLoading(true)
    const [{ data: profiles }, { data: subs }] = await Promise.all([
      supabase.from('profiles').select('id, name, email, role, created_at').order('created_at'),
      supabase.from('subscriptions').select('*'),
    ])

    const subMap = {}
    for (const s of (subs || [])) subMap[s.user_id] = s

    setRows(
      (profiles || [])
        .filter(p => p.role !== 'admin')
        .map(p => {
          const s = subMap[p.id] || {}
          return {
            user_id:            p.id,
            name:               p.name    || '—',
            email:              p.email   || '—',
            plan:               s.plan    || 'free',
            status:             s.status  || 'active',
            started_at:         s.started_at || p.created_at,
            expires_at:         s.expires_at || null,
            stripe_customer_id: s.stripe_customer_id || null,
          }
        })
    )
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // Close promo dropdown on outside click
  useEffect(() => {
    if (!promoPos) return
    const handler = (e) => {
      if (!e.target.closest('[data-promo-menu]')) setPromoPos(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [promoPos])

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const callAction = async (action, row, months) => {
    setActioning(row.user_id)
    setPromoPos(null)

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    try {
      const res = await fetch('/.netlify/functions/admin-subscription', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({
          action,
          targetUserId: row.user_id,
          targetEmail:  row.email,
          targetName:   row.name,
          months,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error desconocido')

      const labels = {
        activate: `✓ PRO activado para ${row.name}`,
        revoke:   `✓ PRO revocado para ${row.name}`,
        promo:    `✓ Promo ${months} mes${months > 1 ? 'es' : ''} enviada a ${row.name}`,
      }
      setToast({ text: labels[action] || '✓ Acción completada', ok: true })
      await load()
    } catch (err) {
      setToast({ text: err.message, ok: false })
    }
    setActioning(null)
  }

  const openPromo = (e, row) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPromoPos({ top: rect.bottom + 6, left: rect.left, userId: row.user_id, row })
  }

  const filtered = rows.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                        r.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || r.plan === filter
    return matchSearch && matchFilter
  })

  const total = rows.length
  const pro   = rows.filter(r => r.plan === 'pro').length
  const free  = total - pro
  const promos = rows.filter(r => r.expires_at && r.plan === 'pro').length

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Suscripciones</div>
          <div className="page-sub">Gestiona planes, promos y acceso PRO de cada usuario</div>
        </div>
      </div>

      {/* Métricas */}
      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 20 }}>
        <div className="metric-card accent-blue">
          <div className="metric-label">Total usuarios</div>
          <div className="metric-val c-blue">{total}</div>
        </div>
        <div className="metric-card" style={{ background: 'rgba(0,212,255,.06)', border: '1px solid rgba(0,212,255,.15)' }}>
          <div className="metric-label">Plan PRO</div>
          <div className="metric-val" style={{ color: 'var(--accent)' }}>{pro}</div>
        </div>
        <div className="metric-card accent-amber">
          <div className="metric-label">Promos activas</div>
          <div className="metric-val c-amber">{promos}</div>
        </div>
        <div className="metric-card accent-surface">
          <div className="metric-label">Plan Free</div>
          <div className="metric-val" style={{ color: 'var(--text3)' }}>{free}</div>
        </div>
      </div>

      <div className="card">
        {/* Filtros */}
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
            style={{ padding: '6px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}
          >
            <option value="all">Todos los planes</option>
            <option value="pro">Solo PRO</option>
            <option value="free">Solo Free</option>
          </select>
          <span style={{ fontSize: 13, color: 'var(--text3)', marginLeft: 'auto' }}>
            {filtered.length} de {total}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)', fontSize: 13 }}>
            <i className="ti ti-loader" style={{ fontSize: 20, display: 'block', marginBottom: 8 }}></i>
            Cargando...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Tipo</th>
                  <th>Inicio</th>
                  <th>Expiración</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text3)', padding: '32px 0' }}>
                      No se encontraron resultados
                    </td>
                  </tr>
                ) : filtered.map(r => {
                  const type = getType(r)
                  const isPro = r.plan === 'pro'
                  const acting = actioning === r.user_id
                  const expiring = isExpiringSoon(r.expires_at)

                  return (
                    <tr key={r.user_id}>
                      {/* Usuario */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                            background: isPro ? 'rgba(0,212,255,.12)' : 'var(--surface2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700,
                            color: isPro ? 'var(--accent)' : 'var(--text2)',
                          }}>
                            {r.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 13 }}>{r.name}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ color: 'var(--text2)', fontSize: 12 }}>{r.email}</td>

                      {/* Plan badge */}
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          background: isPro ? 'rgba(0,212,255,.1)' : 'var(--surface2)',
                          color: isPro ? 'var(--accent)' : 'var(--text3)',
                          border: isPro ? '1px solid rgba(0,212,255,.2)' : '1px solid var(--border)',
                        }}>
                          {isPro && <i className="ti ti-bolt" style={{ fontSize: 10 }}></i>}
                          {isPro ? 'PRO' : 'FREE'}
                        </span>
                      </td>

                      {/* Tipo */}
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 600, color: type.color }}>
                          {type.label}
                        </span>
                      </td>

                      {/* Fecha inicio */}
                      <td style={{ color: 'var(--text3)', fontSize: 12 }}>{fmt(r.started_at)}</td>

                      {/* Expiración */}
                      <td style={{ fontSize: 12 }}>
                        {r.expires_at ? (
                          <span style={{ color: expiring ? 'var(--amber)' : 'var(--text2)', fontWeight: expiring ? 600 : 400 }}>
                            {expiring && <i className="ti ti-alert-triangle" style={{ fontSize: 11, marginRight: 3 }}></i>}
                            {fmt(r.expires_at)}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text3)' }}>—</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td>
                        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                          {acting ? (
                            <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                              <i className="ti ti-loader" style={{ fontSize: 13 }}></i>
                            </span>
                          ) : (
                            <>
                              {/* Activar / Revocar */}
                              {!isPro ? (
                                <button
                                  className="btn-icon"
                                  onClick={() => callAction('activate', r)}
                                  title="Activar PRO"
                                  style={{ color: 'var(--accent)', fontSize: 11, gap: 4, display: 'flex', alignItems: 'center', padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(0,212,255,.3)', background: 'rgba(0,212,255,.06)', whiteSpace: 'nowrap' }}
                                >
                                  <i className="ti ti-bolt" style={{ fontSize: 11 }}></i>Activar PRO
                                </button>
                              ) : (
                                <button
                                  className="btn-icon"
                                  onClick={() => callAction('revoke', r)}
                                  title="Revocar PRO"
                                  style={{ color: 'var(--red)', fontSize: 11, gap: 4, display: 'flex', alignItems: 'center', padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(224,85,85,.3)', background: 'rgba(224,85,85,.06)', whiteSpace: 'nowrap' }}
                                >
                                  <i className="ti ti-ban" style={{ fontSize: 11 }}></i>Revocar
                                </button>
                              )}

                              {/* Dar promo */}
                              <button
                                className="btn-icon"
                                onClick={e => openPromo(e, r)}
                                title="Dar promoción"
                                style={{ fontSize: 11, gap: 4, display: 'flex', alignItems: 'center', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', whiteSpace: 'nowrap' }}
                              >
                                <i className="ti ti-gift" style={{ fontSize: 11 }}></i>Promo
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Promo dropdown (fixed-position, outside table) */}
      {promoPos && (
        <div
          data-promo-menu
          style={{
            position: 'fixed',
            top:  promoPos.top,
            left: promoPos.left,
            zIndex: 500,
            background: 'var(--surface)',
            border: '1px solid var(--border-md)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-md)',
            padding: '6px',
            minWidth: 170,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', padding: '4px 8px 6px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
            Dar promoción a {promoPos.row.name.split(' ')[0]}
          </div>
          {[1, 2].map(m => (
            <button
              key={m}
              onClick={() => callAction('promo', promoPos.row, m)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '8px 10px', borderRadius: 'var(--radius-xs)',
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 13, color: 'var(--text)', fontFamily: 'inherit',
                transition: 'background .12s', textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <i className="ti ti-gift" style={{ fontSize: 14, color: 'var(--amber)' }}></i>
              {m === 1 ? '1 mes gratis' : '2 meses gratis'}
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text3)' }}>+{m * 30}d</span>
            </button>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 600,
          padding: '12px 18px', borderRadius: 'var(--radius-sm)',
          background: toast.ok ? 'var(--green-light)' : 'var(--red-light)',
          color: toast.ok ? 'var(--green-dark)' : 'var(--red)',
          border: `1px solid ${toast.ok ? 'rgba(29,158,117,.3)' : 'rgba(224,85,85,.3)'}`,
          fontSize: 13, fontWeight: 500,
          boxShadow: 'var(--shadow-md)',
          animation: 'tour-in .2s ease forwards',
        }}>
          {toast.text}
        </div>
      )}
    </div>
  )
}
