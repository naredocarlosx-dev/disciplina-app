import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const SUBS_CSS = `
.subs-table { width: 100%; border-collapse: collapse; font-size: 13px; table-layout: fixed; }
.subs-table th {
  text-align: left; font-size: 10px; font-weight: 700; letter-spacing: .07em;
  text-transform: uppercase; color: var(--text3);
  padding: 10px 14px; border-bottom: 2px solid var(--border);
  white-space: nowrap; overflow: hidden;
}
.subs-table td {
  padding: 13px 14px; border-bottom: 1px solid var(--border);
  vertical-align: middle; overflow: hidden; text-overflow: ellipsis;
}
.subs-table tr:last-child td { border-bottom: none; }
.subs-table tr:hover td { background: rgba(255,255,255,.025); }
.subs-table .col-name   { width: 160px; }
.subs-table .col-email  { width: auto;  }
.subs-table .col-plan   { width: 80px;  }
.subs-table .col-tipo   { width: 80px;  }
.subs-table .col-inicio { width: 110px; }
.subs-table .col-expira { width: 120px; }
.subs-table .col-action { width: 220px; }
.subs-plan-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 20px;
}
.subs-btn {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 6px;
  border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
  transition: opacity .15s, background .15s; white-space: nowrap;
}
.subs-btn:disabled { opacity: .4; cursor: not-allowed; }
.subs-btn-pro  { background: rgba(0,212,255,.12); color: #00D4FF; border: 1px solid rgba(0,212,255,.3); }
.subs-btn-pro:hover:not(:disabled) { background: rgba(0,212,255,.22); }
.subs-btn-rev  { background: rgba(224,85,85,.1);  color: var(--red);    border: 1px solid rgba(224,85,85,.28); }
.subs-btn-rev:hover:not(:disabled) { background: rgba(224,85,85,.2); }
.subs-btn-promo { background: rgba(212,145,30,.1); color: var(--amber);  border: 1px solid rgba(212,145,30,.28); }
.subs-btn-promo:hover:not(:disabled) { background: rgba(212,145,30,.2); }
.subs-spinner { display:inline-block; width:13px; height:13px; border:2px solid var(--border); border-top-color:var(--accent); border-radius:50%; animation:spin .7s linear infinite; }
@keyframes subs-toast-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
`

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getType(row) {
  if (!row.plan || row.plan === 'free') return { label: '—',      color: 'var(--text3)'  }
  if (row.stripe_customer_id)           return { label: 'Stripe', color: 'var(--blue)'   }
  if (row.expires_at)                   return { label: 'Promo',  color: 'var(--amber)'  }
  return                                       { label: 'Manual', color: 'var(--purple)' }
}

function isExpiringSoon(expires_at) {
  if (!expires_at) return false
  const days = (new Date(expires_at) - new Date()) / 86400000
  return days >= 0 && days <= 7
}

export default function AdminSuscripciones() {
  const [rows,      setRows]      = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState('all')
  const [actioning, setActioning] = useState(null)  // userId being processed
  const [promoPos,  setPromoPos]  = useState(null)  // { top, left, row }
  const [toast,     setToast]     = useState(null)  // { text, ok }

  const fetchRows = async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    const [{ data: profiles }, subsRes] = await Promise.all([
      supabase.from('profiles').select('id, name, email, role, created_at').order('created_at'),
      token
        ? fetch('/.netlify/functions/admin-get-subs', {
            headers: { Authorization: `Bearer ${token}` },
          }).then(r => r.ok ? r.json() : { subs: [] }).catch(() => ({ subs: [] }))
        : Promise.resolve({ subs: [] }),
    ])

    const subMap = {}
    for (const s of (subsRes.subs || [])) subMap[s.user_id] = s

    return (profiles || [])
      .filter(p => p.role !== 'admin')
      .map(p => {
        const s = subMap[p.id] || {}
        return {
          user_id:            p.id,
          name:               p.name  || '—',
          email:              p.email || '—',
          plan:               s.plan        || 'free',
          started_at:         s.started_at  || p.created_at,
          expires_at:         s.expires_at  || null,
          stripe_customer_id: s.stripe_customer_id || null,
        }
      })
  }

  const load = async () => {
    setLoading(true)
    setRows(await fetchRows())
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
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const callAction = async (action, row, months) => {
    setActioning(row.user_id)
    setPromoPos(null)

    try {
      // getSession INSIDE try so any failure is caught and spinner is cleared
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (!token) throw new Error('Sesión expirada. Recarga la página.')

      // 1 — DB action
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
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`)

      // 2 — Optimistic local update — badge flips immediately
      const now = new Date().toISOString()
      setRows(prev => prev.map(r => {
        if (r.user_id !== row.user_id) return r
        if (action === 'activate') return { ...r, plan: 'pro', started_at: now, expires_at: null }
        if (action === 'revoke')   return { ...r, plan: 'free', expires_at: null }
        if (action === 'promo') {
          const exp = new Date(); exp.setDate(exp.getDate() + (months || 1) * 30)
          return { ...r, plan: 'pro', started_at: now, expires_at: exp.toISOString() }
        }
        return r
      }))

      // 3 — Email notification (best-effort — failure doesn't block the action)
      let expiresAt = null
      if (action === 'promo' && months) {
        const d = new Date()
        d.setDate(d.getDate() + months * 30)
        expiresAt = d.toISOString()
      }

      let emailOk = false
      try {
        const emailRes = await fetch('/.netlify/functions/send-admin-email', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body:    JSON.stringify({ action, targetEmail: row.email, targetName: row.name, months, expiresAt }),
        })
        const emailData = await emailRes.json().catch(() => ({}))
        emailOk = emailRes.ok && emailData.ok && !emailData.skipped
      } catch (emailErr) {
        console.error('[admin] send-admin-email failed:', emailErr)
      }

      // 4 — Toast
      const actionLabel = {
        activate: 'PRO activado',
        revoke:   'PRO revocado',
        promo:    `Promo de ${months} mes${months > 1 ? 'es' : ''} otorgada`,
      }
      const suffix = emailOk ? `. Correo enviado a ${row.email}` : ` (correo no enviado)`
      setToast({ text: `✓ ${actionLabel[action] || 'Listo'}${suffix}`, ok: true })

    } catch (err) {
      console.error('[admin] callAction error:', err)
      setToast({ text: err.message, ok: false })
    } finally {
      // finally guarantees the spinner always clears regardless of what happened
      setActioning(null)
    }
  }

  const openPromo = (e, row) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPromoPos({ top: rect.bottom + 6, left: rect.left, row })
  }

  const filtered = rows.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    const matchFilter = filter === 'all' || r.plan === filter
    return matchSearch && matchFilter
  })

  const total  = rows.length
  const pro    = rows.filter(r => r.plan === 'pro').length
  const promos = rows.filter(r => r.expires_at && r.plan === 'pro').length

  return (
    <div>
      <style>{SUBS_CSS}</style>

      <div className="page-header">
        <div>
          <div className="page-title">Suscripciones</div>
          <div className="page-sub">Gestiona planes y acceso PRO de cada usuario</div>
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
          <div className="metric-val" style={{ color: 'var(--text3)' }}>{total - pro}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 8, padding: '16px 20px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 240 }}
          />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ padding: '7px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}
          >
            <option value="all">Todos los planes</option>
            <option value="pro">Solo PRO</option>
            <option value="free">Solo Free</option>
          </select>
          <span style={{ fontSize: 13, color: 'var(--text3)', marginLeft: 'auto' }}>
            {filtered.length} de {total} usuarios
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text3)', fontSize: 13 }}>
            <div className="subs-spinner" style={{ margin: '0 auto 10px' }}></div>
            Cargando suscripciones...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="subs-table">
              <colgroup>
                <col className="col-name" />
                <col className="col-email" />
                <col className="col-plan" />
                <col className="col-tipo" />
                <col className="col-inicio" />
                <col className="col-expira" />
                <col className="col-action" />
              </colgroup>
              <thead>
                <tr>
                  <th>Nombre</th>
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
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text3)', padding: '40px 0' }}>
                      No se encontraron resultados
                    </td>
                  </tr>
                ) : filtered.map(r => {
                  const type     = getType(r)
                  const isPro    = r.plan === 'pro'
                  const acting   = actioning === r.user_id
                  const expiring = isExpiringSoon(r.expires_at)

                  return (
                    <tr key={r.user_id}>

                      {/* Nombre */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                            background: isPro ? 'rgba(0,212,255,.12)' : 'var(--surface2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700,
                            color: isPro ? '#00D4FF' : 'var(--text2)',
                          }}>
                            {r.name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {r.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ color: 'var(--text2)', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.email}
                      </td>

                      {/* Plan badge */}
                      <td>
                        {r.plan !== 'pro' ? (
                          <span className="subs-plan-badge" style={{ background: 'var(--surface2)', color: 'var(--text3)', border: '1px solid var(--border)' }}>
                            FREE
                          </span>
                        ) : r.expires_at ? (
                          <span className="subs-plan-badge" style={{ background: 'rgba(212,145,30,.1)', color: 'var(--amber)', border: '1px solid rgba(212,145,30,.3)' }}>
                            <i className="ti ti-gift" style={{ fontSize: 9 }}></i> PROMO
                          </span>
                        ) : (
                          <span className="subs-plan-badge" style={{ background: 'rgba(0,212,255,.1)', color: '#00D4FF', border: '1px solid rgba(0,212,255,.25)' }}>
                            <i className="ti ti-bolt" style={{ fontSize: 9 }}></i> PRO
                          </span>
                        )}
                      </td>

                      {/* Tipo */}
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 600, color: type.color }}>
                          {type.label}
                        </span>
                      </td>

                      {/* Inicio */}
                      <td style={{ color: 'var(--text3)', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {fmt(r.started_at)}
                      </td>

                      {/* Expiración */}
                      <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                        {r.expires_at ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: expiring ? 'var(--amber)' : 'var(--text2)', fontWeight: expiring ? 600 : 400 }}>
                            {expiring && <i className="ti ti-alert-triangle" style={{ fontSize: 11, flexShrink: 0 }}></i>}
                            {fmt(r.expires_at)}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text3)' }}>—</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td>
                        {acting ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text3)', fontSize: 12 }}>
                            <div className="subs-spinner"></div>
                            Procesando...
                          </div>
                        ) : isPro ? (
                          <button
                            className="subs-btn subs-btn-rev"
                            onClick={() => callAction('revoke', r)}
                            title="Suspender plan PRO"
                          >
                            <i className="ti ti-ban" style={{ fontSize: 11 }}></i>
                            Suspender plan
                          </button>
                        ) : (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'nowrap' }}>
                            <button
                              className="subs-btn subs-btn-pro"
                              onClick={() => callAction('activate', r)}
                              title="Activar PRO manualmente"
                            >
                              <i className="ti ti-bolt" style={{ fontSize: 11 }}></i>
                              Activar PRO
                            </button>
                            <button
                              className="subs-btn subs-btn-promo"
                              onClick={e => openPromo(e, r)}
                              title="Dar meses gratis de PRO"
                            >
                              <i className="ti ti-gift" style={{ fontSize: 11 }}></i>
                              Promo
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Promo dropdown — fixed-position so it escapes table overflow */}
      {promoPos && (
        <div
          data-promo-menu
          style={{
            position: 'fixed',
            top:      promoPos.top,
            left:     promoPos.left,
            zIndex:   800,
            background:   'var(--surface)',
            border:       '1px solid var(--border-md)',
            borderRadius: 'var(--radius-sm)',
            boxShadow:    'var(--shadow-lg)',
            padding:      '6px',
            minWidth:     180,
          }}
        >
          <div style={{
            fontSize: 10, fontWeight: 700, color: 'var(--text3)',
            padding: '4px 10px 8px', textTransform: 'uppercase', letterSpacing: '.06em',
          }}>
            Promo para {promoPos.row.name.split(' ')[0]}
          </div>
          {[1, 2].map(m => (
            <button
              key={m}
              onClick={() => callAction('promo', promoPos.row, m)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '9px 12px', borderRadius: 'var(--radius-xs)',
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 13, color: 'var(--text)', fontFamily: 'inherit',
                transition: 'background .12s', textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <i className="ti ti-gift" style={{ fontSize: 15, color: 'var(--amber)', flexShrink: 0 }}></i>
              <div>
                <div style={{ fontWeight: 600, lineHeight: 1.3 }}>{m === 1 ? '1 mes gratis' : '2 meses gratis'}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>PRO hasta {fmt((() => { const d = new Date(); d.setDate(d.getDate() + m * 30); return d })())}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 900,
          padding: '12px 20px', borderRadius: 'var(--radius-sm)',
          background: toast.ok ? 'var(--green-light)' : 'var(--red-light)',
          color:      toast.ok ? 'var(--green-dark)'  : 'var(--red)',
          border:     `1px solid ${toast.ok ? 'rgba(29,158,117,.3)' : 'rgba(224,85,85,.3)'}`,
          fontSize: 13, fontWeight: 500,
          boxShadow: 'var(--shadow-md)',
          animation: 'subs-toast-in .2s ease forwards',
        }}>
          {toast.text}
        </div>
      )}
    </div>
  )
}
