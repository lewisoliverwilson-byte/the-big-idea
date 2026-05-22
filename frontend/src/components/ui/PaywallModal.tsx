import { useNavigate } from 'react-router-dom'
import { Check, X, TrendingUp } from 'lucide-react'

interface PaywallModalProps {
  onClose: () => void
}

const PRO_FEATURES = [
  '20 reports every week',
  'Full 5-paragraph GPT-4o analysis',
  'All 4 platform comparisons',
  'Trend charts & 6-month data',
  'Margin calculator & source links',
  'Full report history',
]

export function PaywallModal({ onClose }: PaywallModalProps) {
  const navigate = useNavigate()

  return (
    <div style={{
      position:       'fixed',
      inset:          0,
      zIndex:         50,
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      background:     'rgba(15,23,42,0.55)',
      backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        background:   '#FFFFFF',
        border:       '1px solid #E2E8F0',
        borderRadius: 16,
        boxShadow:    '0 20px 60px 0 rgba(15,23,42,0.2)',
        width:        '100%', maxWidth: 420, margin: '0 16px',
        padding:      28, position: 'relative',
        fontFamily:   'Inter, system-ui, sans-serif',
      }}>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14,
            background: 'none', border: '1px solid #E2E8F0',
            borderRadius: 7, padding: '4px 6px',
            color: '#94A3B8', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            transition: 'border-color 0.12s, color 0.12s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#475569'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#CBD5E1' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0' }}
        >
          <X size={14} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{
            width: 48, height: 48, background: '#EEF2FF', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <TrendingUp size={22} style={{ color: '#4F46E5' }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 7, letterSpacing: '-0.02em' }}>
            Upgrade to Pro
          </h2>
          <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>
            Get 20 reports per week with full AI analysis and all platform comparisons.
          </p>
        </div>

        {/* Feature list */}
        <div style={{
          background:   '#F8FAFC',
          border:       '1px solid #E2E8F0',
          borderRadius: 10,
          padding:      '16px 18px',
          marginBottom: 18,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 30, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em' }}>£10</span>
            <span style={{ fontSize: 13, color: '#64748B' }}>/month</span>
            <span style={{ marginLeft: 6, fontSize: 11, color: '#4F46E5', fontWeight: 500 }}>· Cancel anytime</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PRO_FEATURES.map((feature) => (
              <li key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#475569' }}>
                <Check size={13} style={{ color: '#4F46E5', flexShrink: 0, marginTop: 1 }} />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <button
          onClick={() => { onClose(); navigate('/pricing') }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: '#4F46E5', border: 'none', borderRadius: 9,
            padding: '12px 20px', color: '#fff', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', transition: 'background 0.12s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#4338CA')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#4F46E5')}
        >
          Upgrade to Pro — £10/mo
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#94A3B8', marginTop: 9 }}>
          No long-term commitment. Cancel anytime.
        </p>
      </div>
    </div>
  )
}
