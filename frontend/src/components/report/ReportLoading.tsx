import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getReportStatus } from '../../services/api'
import { useReportStore } from '../../store/reportStore'

const STEPS = [
  { icon: '🔍', label: 'Scanning product databases…'    },
  { icon: '📊', label: 'Analysing market data…'          },
  { icon: '⚖️',  label: 'Calculating profit margins…'    },
  { icon: '✨', label: 'Generating AI insights…'          },
  { icon: '📄', label: 'Assembling your report…'         },
]

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
      background:     '#F8FAFC',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '48px 16px',
      fontFamily:     'Inter, system-ui, sans-serif',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 380, width: '100%' }}>

        {/* Animated ring */}
        <div style={{ marginBottom: 28, position: 'relative', display: 'inline-flex' }}>
          <div style={{
            width:          72,
            height:         72,
            borderRadius:   '50%',
            border:         '1px solid #E2E8F0',
            background:     '#FFFFFF',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       26,
            boxShadow:      '0 1px 3px rgba(0,0,0,0.07)',
          }}>
            {STEPS[stepIndex].icon}
          </div>
          <svg
            style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)', animation: 'spin 2s linear infinite' }}
            width="72"
            height="72"
            viewBox="0 0 72 72"
          >
            <circle cx="36" cy="36" r="32" fill="none" stroke="#E2E8F0" strokeWidth="3" />
            <circle
              cx="36" cy="36" r="32"
              fill="none"
              stroke="#4F46E5"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 32}`}
              strokeDashoffset={`${2 * Math.PI * 32 * (1 - pct / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.7s ease' }}
            />
          </svg>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', marginBottom: 6, letterSpacing: '-0.02em' }}>
          Generating your report
        </h2>
        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 28, lineHeight: 1.65 }}>
          Scanning marketplaces and running AI analysis.<br />
          This takes around 15–25 seconds.
        </p>

        {/* Steps list */}
        <div style={{
          background:   '#FFFFFF',
          border:       '1px solid #E2E8F0',
          borderRadius: 12,
          padding:      '14px 18px',
          textAlign:    'left',
          boxShadow:    '0 1px 3px rgba(0,0,0,0.05)',
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
                  padding:    '7px 0',
                  opacity:    pending ? 0.25 : done ? 0.55 : 1,
                  transition: 'opacity 0.5s',
                }}
              >
                <div style={{
                  width:        8,
                  height:       8,
                  borderRadius: '50%',
                  flexShrink:   0,
                  background:   done   ? '#10B981'
                              : active ? '#4F46E5'
                              : '#CBD5E1',
                  boxShadow:    active ? '0 0 8px rgba(79,70,229,0.4)' : 'none',
                  animation:    active ? 'pulse 1.5s ease-in-out infinite' : 'none',
                }} />
                <span style={{
                  fontSize:   13,
                  fontWeight: active ? 600 : 400,
                  color:      active ? '#0F172A' : '#64748B',
                }}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>

        {data?.status === 'failed' && (
          <div style={{
            marginTop:    14,
            fontSize:     13,
            color:        '#DC2626',
            background:   '#FEF2F2',
            border:       '1px solid #FECACA',
            borderRadius: 10,
            padding:      '12px 16px',
          }}>
            Something went wrong generating your report. Please try again from your dashboard.
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(-90deg) rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  )
}
