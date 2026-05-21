import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import type { ReactNode } from 'react'

interface LockedSectionProps {
  children: ReactNode
  isLocked: boolean
  /** Short label shown in the lock overlay */
  featureName: string
  /** Extra context shown in the overlay subtitle */
  subtitle?: string
}

/**
 * Wraps a report section and blurs it for free-tier users.
 * Pass isLocked=false (Pro users) to render children normally.
 */
export function LockedSection({ children, isLocked, featureName, subtitle }: LockedSectionProps) {
  if (!isLocked) return <>{children}</>

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Blurred preview */}
      <div className="select-none pointer-events-none blur-sm opacity-60">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950/30 to-slate-950/95 backdrop-blur-[2px] rounded-2xl">
        <div className="text-center px-6 py-8 max-w-sm">
          {/* Lock icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600 mb-4 shadow-lg shadow-indigo-600/30">
            <Lock className="h-6 w-6 text-white" />
          </div>

          <h3 className="text-lg font-bold text-white mb-1">{featureName}</h3>
          <p className="text-sm text-slate-400 mb-5">
            {subtitle ?? 'This section is included in Pro reports. Upgrade to unlock the full analysis.'}
          </p>

          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors shadow-md"
          >
            <Lock className="h-3.5 w-3.5" />
            Unlock with Pro — £10/mo
          </Link>

          <p className="text-xs text-slate-500 mt-3">Cancel anytime</p>
        </div>
      </div>
    </div>
  )
}
