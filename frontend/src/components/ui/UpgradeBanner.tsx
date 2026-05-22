import { Link } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'

interface UpgradeBannerProps {
  title?:       string
  description?: string
  ctaLabel?:    string
  variant?:     'inline' | 'full'
}

/**
 * Professional upgrade CTA — used across Dashboard, ReportPage, etc.
 */
export function UpgradeBanner({
  title       = 'Unlock the full picture',
  description = 'Pro gives you 20 reports a week, full 5-paragraph AI analysis, all 4 platform comparisons, and trend charts — everything you need to make the right call.',
  ctaLabel    = 'Upgrade to Pro — £10/month',
  variant     = 'inline',
}: UpgradeBannerProps) {
  if (variant === 'full') {
    return (
      <div style={{
        background:   '#FFFFFF',
        border:       '1px solid #E2E8F0',
        borderRadius: 12,
        padding:      '24px 28px',
        boxShadow:    '0 1px 3px 0 rgba(0,0,0,0.07)',
        fontFamily:   'Inter, system-ui, sans-serif',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
              <TrendingUp size={14} style={{ color: '#4F46E5' }} />
              <span style={{ color: '#4F46E5', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pro Plan</span>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 7, letterSpacing: '-0.02em' }}>{title}</h2>
            <p style={{ color: '#64748B', maxWidth: 500, fontSize: 13, lineHeight: 1.65 }}>{description}</p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <Link
              to="/pricing"
              style={{
                display:        'inline-flex',
                alignItems:     'center',
                gap:            7,
                background:     '#4F46E5',
                border:         'none',
                borderRadius:   8,
                padding:        '10px 22px',
                color:          '#fff',
                fontSize:       13,
                fontWeight:     600,
                textDecoration: 'none',
                whiteSpace:     'nowrap',
                transition:     'background 0.12s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#4338CA')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#4F46E5')}
            >
              {ctaLabel}
            </Link>
            <p style={{ color: '#94A3B8', fontSize: 11, marginTop: 7, textAlign: 'center' }}>Cancel anytime</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      borderRadius:   10,
      background:     '#F8FAFC',
      border:         '1px solid #E2E8F0',
      padding:        '12px 16px',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      gap:            14,
      fontFamily:     'Inter, system-ui, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          flexShrink:     0,
          width:          30,
          height:         30,
          borderRadius:   '50%',
          background:     '#EEF2FF',
          border:         '1px solid #C7D2FE',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
        }}>
          <TrendingUp size={13} style={{ color: '#4F46E5' }} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{title}</p>
          <p style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{description}</p>
        </div>
      </div>
      <Link
        to="/pricing"
        style={{
          flexShrink:     0,
          display:        'inline-flex',
          alignItems:     'center',
          gap:            5,
          background:     '#4F46E5',
          border:         'none',
          borderRadius:   7,
          padding:        '7px 14px',
          color:          '#fff',
          fontSize:       12,
          fontWeight:     600,
          textDecoration: 'none',
          whiteSpace:     'nowrap',
          transition:     'background 0.12s',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#4338CA')}
        onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#4F46E5')}
      >
        {ctaLabel}
      </Link>
    </div>
  )
}
