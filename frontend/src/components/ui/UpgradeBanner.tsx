import { Link } from 'react-router-dom'

interface UpgradeBannerProps {
  title?:       string
  description?: string
  ctaLabel?:    string
  variant?:     'inline' | 'full'
}

const GBTN = 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)'
const GRAD = 'linear-gradient(135deg, #C084FC 0%, #818CF8 50%, #22D3EE 100%)'

/**
 * Dark magic upgrade CTA — used across Dashboard, ReportPage, etc.
 */
export function UpgradeBanner({
  title       = 'Unlock the full picture',
  description = 'Pro gives you 20 ideas a week, full 5-paragraph AI analysis, all 4 platform comparisons, and trend charts — everything you need to make the right call.',
  ctaLabel    = '✦ Go Pro — £10/month',
  variant     = 'inline',
}: UpgradeBannerProps) {
  if (variant === 'full') {
    return (
      <div style={{
        position:     'relative',
        overflow:     'hidden',
        borderRadius: 20,
        background:   'rgba(14,10,28,0.85)',
        border:       '1px solid rgba(139,92,246,0.3)',
        padding:      '32px 32px',
        boxShadow:    '0 0 40px rgba(124,58,237,0.12)',
      }}>
        {/* Ambient glows */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 14 }}>✦</span>
              <span style={{ color: '#A78BFA', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sorcerer Plan</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F0EEFF', marginBottom: 8 }}>{title}</h2>
            <p style={{ color: '#9B8ECF', maxWidth: 500, fontSize: 13, lineHeight: 1.65 }}>{description}</p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <Link
              to="/pricing"
              style={{
                display:        'inline-flex',
                alignItems:     'center',
                gap:            8,
                background:     GBTN,
                border:         '1px solid rgba(139,92,246,0.4)',
                borderRadius:   99,
                padding:        '12px 28px',
                color:          '#fff',
                fontSize:       13,
                fontWeight:     700,
                textDecoration: 'none',
                boxShadow:      '0 0 20px rgba(124,58,237,0.3)',
                whiteSpace:     'nowrap',
              }}
            >
              {ctaLabel}
            </Link>
            <p style={{ color: '#5A4F7A', fontSize: 11, marginTop: 8, textAlign: 'center' }}>Cancel anytime</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      borderRadius: 16,
      background:   'rgba(14,10,28,0.80)',
      border:       '1px solid rgba(139,92,246,0.2)',
      padding:      '14px 20px',
      display:      'flex',
      alignItems:   'center',
      justifyContent: 'space-between',
      gap:          16,
      boxShadow:    '0 0 16px rgba(124,58,237,0.08)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          flexShrink:     0,
          width:          32,
          height:         32,
          borderRadius:   '50%',
          background:     GRAD,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       13,
        }}>
          ✦
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#F0EEFF' }}>{title}</p>
          <p style={{ fontSize: 11, color: '#9B8ECF', marginTop: 2 }}>{description}</p>
        </div>
      </div>
      <Link
        to="/pricing"
        style={{
          flexShrink:     0,
          display:        'inline-flex',
          alignItems:     'center',
          gap:            6,
          background:     GBTN,
          border:         '1px solid rgba(139,92,246,0.4)',
          borderRadius:   99,
          padding:        '8px 18px',
          color:          '#fff',
          fontSize:       12,
          fontWeight:     700,
          textDecoration: 'none',
          whiteSpace:     'nowrap',
        }}
      >
        {ctaLabel}
      </Link>
    </div>
  )
}
