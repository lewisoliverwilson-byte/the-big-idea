import { useNavigate } from 'react-router-dom'
import { Button } from './Button'
import { CheckCircle, X, Crown } from 'lucide-react'

interface PaywallModalProps {
  onClose: () => void
}

const PRO_FEATURES = [
  '20 fresh ideas every week',
  'Full 5-paragraph GPT-4o analysis',
  'All 4 platform comparisons (Amazon, eBay, Etsy, Shopify)',
  'Trend charts & 6-month data',
  'Margin calculator & buy links',
  'Full report history',
]

export function PaywallModal({ onClose }: PaywallModalProps) {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-amber-400/20 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative z-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-400/10 border border-amber-400/30 rounded-full mb-4">
              <Crown className="h-6 w-6 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {`You've hit your free limit`}
            </h2>
            <p className="text-slate-400 mt-2 text-sm">
              Upgrade to Pro for 20 ideas a week with full research.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 mb-6">
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-white">£10</span>
              <span className="text-slate-400 text-sm">/month</span>
              <span className="ml-2 text-amber-400 text-xs">· Cancel anytime</span>
            </div>
            <ul className="space-y-2.5">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => {
              onClose()
              navigate('/pricing')
            }}
            className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-amber-400/20"
          >
            Upgrade to Pro — £10/mo
          </button>

          <p className="text-center text-xs text-slate-600 mt-3">
            No long-term commitment. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  )
}
