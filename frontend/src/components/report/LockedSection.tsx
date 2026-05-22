import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import type { ReactNode } from 'react'

interface LockedSectionProps {
  children:    ReactNode
  isLocked:    boolean
  featureName: string
  subtitle?:   string
}

/**
 * Wraps a report section and blurs it for free-tier users.
 * Pass isLocked=false (Pro users) to render children normally.
 */
export function LockedSection({ children, isLocked, featureName, subtitle }: LockedSectionProps) {
  if (!isLocked) return <>{children}</>

  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
      {/* Blurred preview */}
      <div style={{ userSelect: 'none', pointerEvents: 'none', filter: 'blur(3px)', opacity: 0.35 }}>
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
        background:     'linear-gradient(to bottom, rgba(248,250,252,0.3) 0%, rgba(248,250,252,0.94) 100%)',
        borderRadius:   12,
      }}>
        <div style={{ textAlign: 'center', padding: '28px 24px', maxWidth: 340 }}>

          {/* Lock icon */}
          <div style={{
            width:          48,
            height:         48,
            background:     '#EEF2FF',
            border:         '1px solid #C7D2FE',
            borderRadius:   '50%',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            margin:         '0 auto 14px',
          }}>
            <Lock size={20} style={{ color: '#4F46E5' }} />
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 6, fontFamily: 'Inter, system-ui, sans-serif' }}>
            {featureName}
          </h3>
          <p style={{ fontSize: 13, color: '#475569', marginBottom: 18, lineHeight: 1.6, fontFamily: 'Inter, system-ui, sans-serif' }}>
            {subtitle ?? 'This section is available on the Pro plan. Upgrade to unlock the full report.'}
          </p>

          <Link
            to="/pricing"
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            8,
              background:     '#4F46E5',
              borderRadius:   8,
              padding:        '10px 22px',
              color:          '#fff',
              fontSize:       13,
              fontWeight:     600,
              textDecoration: 'none',
              transition:     'background 0.12s',
              fontFamily:     'Inter, system-ui, sans-serif',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#4338CA')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#4F46E5')}
          >
            Upgrade to Pro — £10/mo
          </Link>

          <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>
            Cancel anytime
          </p>
        </div>
      </div>
    </div>
  )
}
