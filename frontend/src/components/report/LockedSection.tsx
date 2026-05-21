import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface LockedSectionProps {
  children:    ReactNode
  isLocked:    boolean
  /** Short label shown in the lock overlay */
  featureName: string
  /** Extra context shown in the overlay subtitle */
  subtitle?:   string
}

const C = {
  border:  'rgba(139,92,246,0.2)',
  purple:  '#8B5CF6',
  purpleB: '#A78BFA',
  text:    '#F0EEFF',
  textDim: '#9B8ECF',
  textMut: '#5A4F7A',
}

const GBTN = 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)'
const GRAD = 'linear-gradient(135deg, #C084FC 0%, #818CF8 50%, #22D3EE 100%)'

/**
 * Wraps a report section and blurs it for free-tier users.
 * Pass isLocked=false (Pro users) to render children normally.
 */
export function LockedSection({ children, isLocked, featureName, subtitle }: LockedSectionProps) {
  if (!isLocked) return <>{children}</>

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden' }}>
      {/* Blurred preview */}
      <div style={{ userSelect: 'none', pointerEvents: 'none', filter: 'blur(4px)', opacity: 0.4 }}>
        {children}
      </div>

      {/* Lock overlay */}
      <div style={{
        position:       'absolute',
        inset:          0,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        background:     'linear-gradient(to bottom, rgba(7,5,17,0.2) 0%, rgba(7,5,17,0.92) 100%)',
        backdropFilter: 'blur(2px)',
        borderRadius:   16,
      }}>
        <div style={{ textAlign: 'center', padding: '32px 24px', maxWidth: 340 }}>

          {/* Lock icon */}
          <div style={{
            width:          56,
            height:         56,
            background:     GRAD,
            borderRadius:   '50%',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            margin:         '0 auto 16px',
            fontSize:       22,
            boxShadow:      '0 0 20px rgba(139,92,246,0.4)',
          }}>
            🔮
          </div>

          <h3 style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 8 }}>{featureName}</h3>
          <p style={{ fontSize: 13, color: C.textDim, marginBottom: 20, lineHeight: 1.6 }}>
            {subtitle ?? 'This vision is sealed for Sorcerer tier. Upgrade to unlock the full oracle.'}
          </p>

          <Link
            to="/pricing"
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            8,
              background:     GBTN,
              border:         '1px solid rgba(139,92,246,0.4)',
              borderRadius:   99,
              padding:        '10px 22px',
              color:          '#fff',
              fontSize:       13,
              fontWeight:     700,
              textDecoration: 'none',
              boxShadow:      '0 0 16px rgba(124,58,237,0.3)',
              transition:     'opacity 0.15s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.85')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}
          >
            ✦ Unlock with Sorcerer — £10/mo
          </Link>

          <p style={{ fontSize: 11, color: C.textMut, marginTop: 10 }}>Cancel anytime</p>
        </div>
      </div>
    </div>
  )
}
