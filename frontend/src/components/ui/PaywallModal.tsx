import { useNavigate } from 'react-router-dom'
import { CheckCircle, X } from 'lucide-react'
import type { CSSProperties } from 'react'

interface PaywallModalProps {
  onClose: () => void
}

const C = {
  border:  'rgba(139,92,246,0.2)',
  purple:  '#8B5CF6',
  purpleB: '#A78BFA',
  text:    '#F0EEFF',
  textDim: '#9B8ECF',
  textMut: '#5A4F7A',
}

const GRAD = 'linear-gradient(135deg, #C084FC 0%, #818CF8 50%, #22D3EE 100%)'
const GBTN = 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)'

const GLASS: CSSProperties = {
  background:           'rgba(14,10,28,0.92)',
  backdropFilter:       'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border:               '1px solid rgba(139,92,246,0.25)',
  borderRadius:         20,
  boxShadow:            '0 0 0 1px rgba(139,92,246,0.08), 0 32px 64px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
}

const PRO_FEATURES = [
  '20 spells every week',
  'Full 5-paragraph oracle (GPT-4o)',
  'All 4 platform comparisons',
  'Trend charts & 6-month data',
  'Margin calculator & source links',
  'Full grimoire history',
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
      background:     'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{ ...GLASS, width: '100%', maxWidth: 440, margin: '0 16px', padding: 32, position: 'relative', overflow: 'hidden' }}>

        {/* Glow */}
        <div style={{
          position:      'absolute',
          top:           -80,
          right:         -80,
          width:         240,
          height:        240,
          background:    'radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%)',
          borderRadius:  '50%',
          pointerEvents: 'none',
        }} />
        <div style={{
          position:      'absolute',
          bottom:        -60,
          left:          -60,
          width:         180,
          height:        180,
          background:    'radial-gradient(ellipse, rgba(34,211,238,0.08) 0%, transparent 70%)',
          borderRadius:  '50%',
          pointerEvents: 'none',
        }} />

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position:   'absolute',
            top:        16,
            right:      16,
            background: 'none',
            border:     `1px solid ${C.border}`,
            borderRadius: 8,
            padding:    '4px 6px',
            color:      C.textMut,
            cursor:     'pointer',
            display:    'flex',
            alignItems: 'center',
            zIndex:     10,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.text; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.4)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = C.textMut; (e.currentTarget as HTMLButtonElement).style.borderColor = C.border }}
        >
          <X size={14} />
        </button>

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width:          56,
              height:         56,
              background:     GRAD,
              borderRadius:   '50%',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              margin:         '0 auto 16px',
              fontSize:       24,
              boxShadow:      '0 0 24px rgba(139,92,246,0.4)',
            }}>
              ✦
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 8 }}>
              Your spells are spent
            </h2>
            <p style={{ fontSize: 13, color: C.textDim }}>
              Ascend to Sorcerer for 20 conjurings a week with full research.
            </p>
          </div>

          {/* Feature list */}
          <div style={{
            background:   'rgba(7,5,17,0.6)',
            border:       `1px solid ${C.border}`,
            borderRadius: 14,
            padding:      '18px 20px',
            marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
              <span style={{
                fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif',
                fontSize:   32,
                fontWeight: 700,
                color:      C.text,
              }}>
                £10
              </span>
              <span style={{ fontSize: 13, color: C.textDim }}>/month</span>
              <span style={{ marginLeft: 6, fontSize: 11, color: C.purpleB }}>· Cancel anytime</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {PRO_FEATURES.map((feature) => (
                <li key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: C.textDim }}>
                  <CheckCircle size={13} style={{ color: C.purple, flexShrink: 0, marginTop: 1 }} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <button
            onClick={() => { onClose(); navigate('/pricing') }}
            style={{
              width:          '100%',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            8,
              background:     GBTN,
              border:         '1px solid rgba(139,92,246,0.4)',
              borderRadius:   12,
              padding:        '13px 24px',
              color:          '#fff',
              fontSize:       15,
              fontWeight:     700,
              cursor:         'pointer',
              boxShadow:      '0 0 24px rgba(124,58,237,0.35)',
              transition:     'opacity 0.15s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
          >
            ✦ Ascend to Sorcerer — £10/mo
          </button>

          <p style={{ textAlign: 'center', fontSize: 11, color: C.textMut, marginTop: 10 }}>
            No long-term binding. Dispel anytime.
          </p>
        </div>
      </div>
    </div>
  )
}
