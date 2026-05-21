import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getReportStatus } from '../../services/api'
import { useReportStore } from '../../store/reportStore'

const STEPS = [
  { icon: '🔮', label: 'Scanning the product grimoire…'  },
  { icon: '📊', label: 'Analysing market currents…'       },
  { icon: '⚖️',  label: 'Calculating profit margins…'     },
  { icon: '✨', label: 'Summoning AI insights…'           },
  { icon: '📜', label: 'Assembling your oracle report…'  },
]

// Deterministic star positions
const STARS = Array.from({ length: 24 }, (_, i) => {
  const g = 137.508
  return {
    left:  `${((i * g)        % 100).toFixed(1)}%`,
    top:   `${((i * g * 0.61) % 100).toFixed(1)}%`,
    size:  [1, 1, 1.5][i % 3],
    delay: `${((i * 0.37) % 4.5).toFixed(2)}s`,
    dur:   `${(2.8 + (i % 6) * 0.45).toFixed(1)}s`,
  }
})

interface ReportLoadingProps {
  reportId: string
}

export function ReportLoading({ reportId }: ReportLoadingProps) {
  const navigate          = useNavigate()
  const { setIsGenerating } = useReportStore()
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1))
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const { data } = useQuery({
    queryKey: ['report-status', reportId],
    queryFn:  () => getReportStatus(reportId),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'ready' || status === 'failed') return false
      return 2000
    },
    enabled: !!reportId,
  })

  useEffect(() => {
    if (data?.status === 'ready') {
      setIsGenerating(false)
      navigate(`/report/${reportId}`, { replace: true })
    }
  }, [data?.status, reportId, navigate, setIsGenerating])

  const pct = Math.round(((stepIndex + 1) / STEPS.length) * 100)

  return (
    <div style={{
      minHeight:      '100vh',
      background:     '#070511',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '48px 16px',
      position:       'relative',
      overflow:       'hidden',
    }}>

      {/* Stars */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {STARS.map((s, i) => (
          <div key={i} className="animate-twinkle" style={{
            position:          'absolute',
            left:              s.left,
            top:               s.top,
            width:             s.size,
            height:            s.size,
            borderRadius:      '50%',
            background:        i % 3 === 0 ? '#A78BFA' : i % 3 === 1 ? '#22D3EE' : '#fff',
            animationDelay:    s.delay,
            animationDuration: s.dur,
          }} />
        ))}
      </div>

      {/* Ambient orb */}
      <div className="animate-float-orb" style={{
        position:      'fixed',
        top:           '20%',
        left:          '50%',
        transform:     'translateX(-50%)',
        width:         400,
        height:        300,
        background:    'radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%)',
        borderRadius:  '50%',
        pointerEvents: 'none',
        zIndex:        0,
      }} />

      <div style={{ textAlign: 'center', maxWidth: 380, width: '100%', position: 'relative', zIndex: 1 }}>

        {/* Animated ring */}
        <div style={{ marginBottom: 32, position: 'relative', display: 'inline-flex' }}>
          <div style={{
            width:          80,
            height:         80,
            borderRadius:   '50%',
            border:         '2px solid rgba(139,92,246,0.15)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       28,
          }}>
            {STEPS[stepIndex].icon}
          </div>
          <svg
            style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)', animation: 'spin 2s linear infinite' }}
            width="80"
            height="80"
            viewBox="0 0 80 80"
          >
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(139,92,246,0.12)" strokeWidth="3" />
            <circle
              cx="40" cy="40" r="36"
              fill="none"
              stroke="url(#loadGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36 * (1 - pct / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.7s ease' }}
            />
            <defs>
              <linearGradient id="loadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#C084FC" />
                <stop offset="50%"  stopColor="#818CF8" />
                <stop offset="100%" stopColor="#22D3EE" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 700, color: '#F0EEFF', marginBottom: 8 }}>
          Conjuring your report
        </h2>
        <p style={{ fontSize: 13, color: '#9B8ECF', marginBottom: 32, lineHeight: 1.65 }}>
          Scanning marketplaces and weaving your AI analysis.<br />
          This takes around 15–25 seconds.
        </p>

        {/* Steps */}
        <div style={{
          background:   'rgba(14,10,28,0.80)',
          backdropFilter: 'blur(20px)',
          border:       '1px solid rgba(139,92,246,0.15)',
          borderRadius: 16,
          padding:      '16px 20px',
          textAlign:    'left',
        }}>
          {STEPS.map((step, i) => {
            const active  = i === stepIndex
            const done    = i < stepIndex
            const pending = i > stepIndex
            return (
              <div
                key={step.label}
                style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        12,
                  padding:    '8px 0',
                  opacity:    pending ? 0.25 : done ? 0.55 : 1,
                  transition: 'opacity 0.5s',
                }}
              >
                <div style={{
                  width:        8,
                  height:       8,
                  borderRadius: '50%',
                  flexShrink:   0,
                  background:   done   ? '#34D399'
                              : active ? '#A78BFA'
                              : 'rgba(139,92,246,0.3)',
                  boxShadow:    active ? '0 0 8px rgba(167,139,250,0.6)' : 'none',
                  animation:    active ? 'pulse 1.5s ease-in-out infinite' : 'none',
                }} />
                <span style={{
                  fontSize:   13,
                  fontWeight: active ? 600 : 400,
                  color:      active ? '#F0EEFF' : '#9B8ECF',
                }}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>

        {data?.status === 'failed' && (
          <div style={{
            marginTop:    16,
            fontSize:     13,
            color:        '#F87171',
            background:   'rgba(248,113,113,0.08)',
            border:       '1px solid rgba(248,113,113,0.2)',
            borderRadius: 12,
            padding:      '12px 16px',
          }}>
            The oracle encountered an error. Please try again from your dashboard.
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(-90deg) rotate(360deg); } }`}</style>
    </div>
  )
}
