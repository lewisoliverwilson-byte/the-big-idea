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

  // Cycle through loading steps
  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  // Poll for status
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        {/* Animated logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-4 relative">
            <svg
              className="animate-spin h-14 w-14 text-indigo-600 absolute"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-20"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-80"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-2xl z-10">🔍</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Building your report
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          We're scanning multiple marketplaces and generating your AI analysis.
          This usually takes 15–30 seconds.
        </p>

        {/* Step indicator */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          {STEPS.map((step, i) => (
            <div
              key={step}
              className={`flex items-center gap-3 py-2 transition-all duration-500 ${
                i === stepIndex
                  ? 'opacity-100'
                  : i < stepIndex
                  ? 'opacity-40'
                  : 'opacity-20'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  i < stepIndex
                    ? 'bg-green-500'
                    : i === stepIndex
                    ? 'bg-indigo-500 animate-pulse'
                    : 'bg-gray-300'
                }`}
              />
              <span
                className={`text-sm ${
                  i === stepIndex ? 'font-medium text-gray-900' : 'text-gray-500'
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>

        {data?.status === 'failed' && (
          <p className="mt-4 text-sm text-red-600">
            Report generation failed. Please try again.
          </p>
        )}
      </div>
    </div>
  )
}
