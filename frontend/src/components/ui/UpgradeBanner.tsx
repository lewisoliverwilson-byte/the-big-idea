import { Link } from 'react-router-dom'
import { Crown, ArrowRight, Zap } from 'lucide-react'

interface UpgradeBannerProps {
  /** Heading text */
  title?: string
  /** Body text */
  description?: string
  /** CTA button label */
  ctaLabel?: string
  /** Visual variant */
  variant?: 'inline' | 'full'
}

/**
 * Dark navy / gold upgrade CTA — used across Dashboard, ReportPage, etc.
 */
export function UpgradeBanner({
  title = 'Unlock the full picture',
  description = 'Pro gives you 20 ideas a week, full 5-paragraph AI analysis, all 4 platform comparisons, and trend charts — everything you need to make the right call.',
  ctaLabel = 'Go Pro — £10/month',
  variant = 'inline',
}: UpgradeBannerProps) {
  if (variant === 'full') {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-amber-400/30 p-8 text-white shadow-xl">
        {/* Background glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-amber-400/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-semibold uppercase tracking-wider">Pro Plan</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-slate-400 max-w-lg text-sm leading-relaxed">{description}</p>
          </div>
          <div className="flex-shrink-0">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-7 py-3.5 rounded-full text-sm transition-colors shadow-lg shadow-amber-400/20 whitespace-nowrap"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-slate-500 text-xs mt-2 text-center">Cancel anytime</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-slate-900 border border-amber-400/20 p-4 flex items-center justify-between gap-4 shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-400/10 flex items-center justify-center">
          <Zap className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">{description}</p>
        </div>
      </div>
      <Link
        to="/pricing"
        className="flex-shrink-0 inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2 rounded-full text-xs transition-colors whitespace-nowrap"
      >
        {ctaLabel}
      </Link>
    </div>
  )
}
