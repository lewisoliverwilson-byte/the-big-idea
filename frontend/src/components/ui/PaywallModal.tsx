import { useNavigate } from 'react-router-dom'
import { Button } from './Button'
import { CheckCircle, X } from 'lucide-react'

interface PaywallModalProps {
  onClose: () => void
}

const PRO_FEATURES = [
  'Unlimited market research reports',
  'AI-powered opportunity analysis',
  'Real-time trend data & charts',
  'Margin calculator with live estimates',
  'Platform comparison table',
  'Direct buy links (Temu, AliExpress, Alibaba)',
  'Report history & saved searches',
]

export function PaywallModal({ onClose }: PaywallModalProps) {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-full mb-4">
            <span className="text-2xl">🚀</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            You've used your free reports
          </h2>
          <p className="text-gray-500 mt-2">
            Upgrade to Pro for unlimited reports and full market intelligence.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-3xl font-bold text-gray-900">£19.99</span>
            <span className="text-gray-500 text-sm">/month</span>
          </div>
          <ul className="space-y-2">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => {
            onClose()
            navigate('/pricing')
          }}
        >
          Upgrade to Pro — £19.99/mo
        </Button>

        <p className="text-center text-xs text-gray-400 mt-3">
          Cancel anytime. No long-term commitment.
        </p>
      </div>
    </div>
  )
}
