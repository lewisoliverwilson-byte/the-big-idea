import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle, Zap } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { createCheckoutSession } from '../services/api'
import { useAuthStore } from '../store/authStore'

const FREE_FEATURES = [
  '2 complete market research reports',
  'Full AI analysis on each report',
  'Margin calculator',
  'Trend charts',
  'Platform comparison',
  'Buy links',
]

const PRO_FEATURES = [
  'Unlimited market research reports',
  'Full AI analysis (GPT-4o) on every report',
  'Real-time trend data — updated every 6 hours',
  'Interactive margin calculator',
  'Cross-platform comparison (Amazon, eBay, Etsy, Shopify)',
  'Direct buy links to Temu, AliExpress, Alibaba',
  'Full report history',
  'Priority report generation',
]

export function Pricing() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const checkoutMutation = useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (data) => {
      window.location.href = data.url
    },
  })

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      navigate('/auth/signup')
      return
    }
    checkoutMutation.mutate()
  }

  const isPro = user?.subscriptionStatus === 'active'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Simple, transparent pricing</h1>
        <p className="text-xl text-gray-500">
          Start free. Upgrade when you find your next big idea.
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Free */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Free</h2>
          <p className="text-gray-500 text-sm mb-5">Try it out, no commitment</p>
          <div className="mb-6">
            <span className="text-4xl font-extrabold text-gray-900">£0</span>
            <span className="text-gray-500 text-sm ml-1">/forever</span>
          </div>
          <ul className="space-y-3 mb-8">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth/signup')}
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get started free'}
          </Button>
        </div>

        {/* Pro */}
        <div className="bg-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="bg-white text-indigo-600 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Zap className="h-3 w-3" /> Popular
            </span>
          </div>
          <h2 className="text-xl font-bold mb-1">Pro</h2>
          <p className="text-indigo-200 text-sm mb-5">For serious dropshippers</p>
          <div className="mb-6">
            <span className="text-4xl font-extrabold">£19.99</span>
            <span className="text-indigo-200 text-sm ml-1">/month</span>
          </div>
          <ul className="space-y-3 mb-8">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-indigo-300 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>

          {isPro ? (
            <Button
              variant="secondary"
              size="lg"
              className="w-full bg-white text-indigo-600 hover:bg-indigo-50"
              onClick={() => navigate('/account')}
            >
              Manage subscription
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              className="w-full bg-white text-indigo-600 hover:bg-indigo-50"
              onClick={handleSubscribe}
              isLoading={checkoutMutation.isPending}
            >
              Subscribe — £19.99/mo
            </Button>
          )}
          <p className="text-center text-indigo-300 text-xs mt-3">
            Cancel anytime. No long-term contracts.
          </p>
        </div>
      </div>

      {/* FAQ teaser */}
      <div className="mt-16 text-center">
        <p className="text-gray-500 text-sm">
          Questions?{' '}
          <a href="/" className="text-indigo-600 hover:underline">
            Check the FAQ on the homepage
          </a>
        </p>
      </div>
    </div>
  )
}
