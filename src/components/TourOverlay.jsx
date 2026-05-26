import { useState, useEffect, useCallback } from 'react'

const TOUR_CSS = `
@keyframes tour-in {
  from { opacity: 0; transform: scale(0.92) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.tour-tip { animation: tour-in 0.24s cubic-bezier(0.34,1.56,0.64,1) forwards; }
`

const GAP    = 14
const MARGIN = 16   // minimum distance from every screen edge
const TW_MAX = 272  // desired width — clamped to screen below

// Which border pair to hide so the rotated square points the right way
const ARROW_HIDE = {
  up:    { borderBottom: 'none', borderRight: 'none' },
  down:  { borderTop:    'none', borderLeft:  'none' },
  left:  { borderTop:    'none', borderRight: 'none' },
  right: { borderBottom: 'none', borderLeft:  'none' },
}

function measure(target, placement) {
  const el = document.querySelector(`[data-tour="${target}"]`)
  if (!el) return null

  const rect = el.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight

  // Clamp tooltip width so it always fits within screen margins
  const tw = Math.min(TW_MAX, vw - MARGIN * 2)

  // Auto-flip vertically when near edge
  let p = placement
  if (p === 'bottom' && rect.bottom + GAP + 180 > vh) p = 'top'
  if (p === 'top'    && rect.top    - GAP - 180 < 0)  p = 'bottom'
  // Auto-flip horizontally when near edge
  if (p === 'right'  && rect.right  + GAP + tw  > vw - MARGIN) p = 'left'
  if (p === 'left'   && rect.left   - GAP - tw  < MARGIN)      p = 'right'

  const cx = rect.left + rect.width / 2

  // Horizontal position: center on element, clamp to stay within margins
  const left = Math.max(MARGIN, Math.min(cx - tw / 2, vw - tw - MARGIN))
  const ax   = Math.max(10, Math.min(cx - left - 6, tw - 22))

  let tipStyle, arrowStyle, arrowDir

  if (p === 'bottom') {
    tipStyle   = { top: rect.bottom + GAP, left }
    arrowStyle = { top: -7, left: ax }
    arrowDir   = 'up'
  } else if (p === 'top') {
    tipStyle   = { bottom: vh - rect.top + GAP, left }
    arrowStyle = { bottom: -7, left: ax }
    arrowDir   = 'down'
  } else if (p === 'right') {
    const tipLeft = Math.max(MARGIN, Math.min(rect.right + GAP, vw - tw - MARGIN))
    const top     = Math.max(MARGIN, Math.min(rect.top + rect.height / 2 - 70, vh - 220))
    tipStyle   = { top, left: tipLeft }
    arrowStyle = { top: Math.max(8, rect.top + rect.height / 2 - top - 6), left: -7 }
    arrowDir   = 'left'
  } else {
    const tipLeft = Math.max(MARGIN, Math.min(rect.left - GAP - tw, vw - tw - MARGIN))
    const top     = Math.max(MARGIN, Math.min(rect.top + rect.height / 2 - 70, vh - 220))
    tipStyle   = { top, left: tipLeft }
    arrowStyle = { top: Math.max(8, rect.top + rect.height / 2 - top - 6), right: -7 }
    arrowDir   = 'right'
  }

  return { rect, tipStyle, arrowStyle, arrowDir, tw }
}

export default function TourOverlay({ steps, tourKey, onDone }) {
  const [idx,  setIdx]  = useState(0)
  const [pos,  setPos]  = useState(null)
  const [key,  setKey]  = useState(0)   // incremented to replay animation

  const finish = useCallback(() => {
    localStorage.setItem(`tour_${tourKey}_done`, 'true')
    onDone()
  }, [tourKey, onDone])

  // Measure target element, scroll into view if needed, then set position
  useEffect(() => {
    const step = steps[idx]
    if (!step) return

    setPos(null)

    const el = document.querySelector(`[data-tour="${step.target}"]`)
    if (!el) {
      // Skip missing elements (e.g. subscribe button when already PRO)
      const t = setTimeout(() => {
        if (idx < steps.length - 1) setIdx(i => i + 1)
        else finish()
      }, 0)
      return () => clearTimeout(t)
    }

    const rect = el.getBoundingClientRect()
    const inView = rect.top >= 60 && rect.bottom <= window.innerHeight - 20

    if (!inView) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }

    const t = setTimeout(() => {
      const p = measure(step.target, step.placement)
      if (p) { setPos(p); setKey(k => k + 1) }
    }, inView ? 50 : 340)

    return () => clearTimeout(t)
  }, [idx, steps, finish])

  const prev = () => {
    if (idx > 0) { setPos(null); setIdx(i => i - 1) }
  }
  const next = () => {
    if (idx < steps.length - 1) { setPos(null); setIdx(i => i + 1) }
    else finish()
  }

  const step = steps[idx]

  return (
    <>
      <style>{TOUR_CSS}</style>

      {/* Full-screen click absorber — prevents accidental nav while tour is open */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9000 }}
           onClick={e => e.stopPropagation()} />

      {/* Spotlight ring around highlighted element */}
      {pos && (
        <div style={{
          position: 'fixed',
          left:   pos.rect.left   - 6,
          top:    pos.rect.top    - 6,
          width:  pos.rect.width  + 12,
          height: pos.rect.height + 12,
          borderRadius: 10,
          zIndex: 9001,
          pointerEvents: 'none',
          // Huge box-shadow creates the dark overlay outside the spotlight
          boxShadow: '0 0 0 9999px rgba(0,0,0,.76), 0 0 0 1.5px rgba(0,212,255,.5), 0 0 20px 5px rgba(0,212,255,.15)',
          border: '1.5px solid rgba(0,212,255,.4)',
        }} />
      )}

      {/* Tooltip card */}
      {pos && (
        <div
          key={key}
          className="tour-tip"
          style={{
            position: 'fixed',
            zIndex: 9002,
            width: pos.tw,
            background: 'rgba(8,8,10,.97)',
            border: '1px solid rgba(0,212,255,.32)',
            borderRadius: 12,
            padding: '16px 18px',
            boxShadow: '0 0 0 1px rgba(0,212,255,.06), 0 12px 48px rgba(0,0,0,.8), 0 0 28px rgba(0,212,255,.08)',
            ...pos.tipStyle,
          }}
        >
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            width: 12, height: 12,
            background: 'rgba(8,8,10,.97)',
            border: '1px solid rgba(0,212,255,.32)',
            transform: 'rotate(45deg)',
            ...ARROW_HIDE[pos.arrowDir],
            ...pos.arrowStyle,
          }} />

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', background: '#00D4FF',
                boxShadow: '0 0 8px rgba(0,212,255,.9)',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '.01em' }}>
                {step.title}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'rgba(0,212,255,.45)', fontFamily: 'DM Mono, monospace' }}>
                {idx + 1}&thinsp;/&thinsp;{steps.length}
              </span>
              <button onClick={finish} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,.3)', fontSize: 14, padding: '2px 4px',
                borderRadius: 4, lineHeight: 1, fontFamily: 'inherit',
                transition: 'color .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,.75)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.3)'}
              >✕</button>
            </div>
          </div>

          {/* Body */}
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.68)', lineHeight: 1.65, margin: '0 0 14px' }}>
            {step.text}
          </p>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 12 }}>
            {steps.map((_, i) => (
              <div key={i} style={{
                width: i === idx ? 16 : 5, height: 5, borderRadius: 3,
                background: i === idx ? '#00D4FF' : 'rgba(0,212,255,.2)',
                transition: 'all .25s ease',
              }} />
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={prev}
              disabled={idx === 0}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 7, fontSize: 12, fontWeight: 600,
                cursor: idx === 0 ? 'default' : 'pointer', transition: 'all .15s',
                border: '1px solid rgba(0,212,255,.22)', background: 'transparent',
                color: idx === 0 ? 'rgba(0,212,255,.2)' : 'rgba(0,212,255,.65)',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >← Anterior</button>
            <button
              onClick={next}
              style={{
                flex: 1.6, padding: '8px 0', borderRadius: 7, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', transition: 'all .15s',
                border: 'none', background: '#00D4FF', color: '#000',
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: '0 0 14px rgba(0,212,255,.45)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#19daff'}
              onMouseLeave={e => e.currentTarget.style.background = '#00D4FF'}
            >
              {idx < steps.length - 1 ? 'Siguiente →' : '¡Listo! ✓'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
