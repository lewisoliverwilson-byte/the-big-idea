import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getReportStatus } from '../../services/api'
import { useReportStore } from '../../store/reportStore'

const STEPS = [
  'Scanning product database…',
  'Analysing market trends…',
  'Calculating profit margins…',
  'Generating AI insights…',
  'Assembling your report…',
]

interface ReportLoadingProps {
  reportId: string
}

export function ReportLoading({ reportId }: ReportLoadingProps) {
  const navigate = useNavigate()
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
    queryFn: () => getReportStatus(reportId),
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4">
      <div className="text-center max-w-sm w-full">
        {/* Animated ring */}
        <div className="mb-8 relative inline-flex">
          <div className="w-20 h-20 rounded-full border-4 border-slate-800 flex items-center justify-center">
            <span className="text-3xl">🔍</span>
          </div>
          <svg
            className="absolute inset-0 -rotate-90 animate-spin"
            style={{ animationDuration: '2s' }}
            width="80"
            height="80"
            viewBox="0 0 80 80"
          >
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="rgb(251 191 36 / 0.2)"
              strokeWidth="4"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#FBBF24"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36 * (1 - pct / 100)}`}
              className="transition-all duration-700"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          Building your report
        </h2>
        <p className="text-slate-400 text-sm mb-8">
          Scanning marketplaces and generating your AI analysis. Usually takes 15–30 seconds.
        </p>

        {/* Steps */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-left">
          {STEPS.map((step, i) => (
            <div
              key={step}
              className={`flex items-center gap-3 py-2 transition-all duration-500 ${
                i === stepIndex ? 'opacity-100' : i < stepIndex ? 'opacity-50' : 'opacity-20'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  i < stepIndex
                    ? 'bg-emerald-400'
                    : i === stepIndex
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-slate-600'
                }`}
              />
              <span className={`text-sm ${i === stepIndex ? 'font-medium text-white' : 'text-slate-500'}`}>
                {step}
              </span>
            </div>
          ))}
        </div>

        {data?.status === 'failed' && (
          <p className="mt-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
            Report generation failed. Please try again from your dashboard.
          </p>
        )}
      </div>
    </div>
  )
}
