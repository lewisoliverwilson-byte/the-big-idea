import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { getMyReports } from '../services/api'
import { SearchForm } from '../components/search/SearchForm'
import { PaywallModal } from '../components/ui/PaywallModal'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { ScoreBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { formatDate } from '../utils/formatters'
import { Search, FileText, ArrowRight, Sparkles } from 'lucide-react'

export function Dashboard() {
  const { user } = useAuthStore()
  const [showPaywall, setShowPaywall] = useState(false)

  const { data: reports, isLoading } = useQuery({
    queryKey: ['my-reports'],
    queryFn: getMyReports,
  })

  const isPro = user?.subscriptionStatus === 'active'
  const freeReportsLeft = Math.max(0, 2 - (user?.reportsUsedFree || 0))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
          </h1>
          <p className="text-gray-500 mt-1">
            {isPro
              ? 'Pro plan · Unlimited reports'
              : `Free tier · ${freeReportsLeft} report${freeReportsLeft !== 1 ? 's' : ''} remaining`}
          </p>
        </div>
        {!isPro && (
          <Link to="/pricing">
            <Button variant="outline" size="sm">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Upgrade to Pro
            </Button>
          </Link>
        )}
      </div>

      {/* Free tier banner */}
      {!isPro && freeReportsLeft === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-amber-800">You've used all your free reports</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Upgrade to Pro to run unlimited reports for £19.99/mo.
            </p>
          </div>
          <Link to="/pricing">
            <Button variant="primary" size="sm">Upgrade now</Button>
          </Link>
        </div>
      )}

      {!isPro && freeReportsLeft > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-indigo-700">
            <span className="font-semibold">{freeReportsLeft} free report{freeReportsLeft !== 1 ? 's' : ''} remaining.</span>{' '}
            <Link to="/pricing" className="underline">Upgrade to Pro</Link> for unlimited reports.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Search Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-indigo-600" />
                <h2 className="font-semibold text-gray-900">Find a product</h2>
              </div>
            </CardHeader>
            <CardBody>
              <SearchForm onPaywallHit={() => setShowPaywall(true)} />
            </CardBody>
          </Card>
        </div>

        {/* Reports History */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  <h2 className="font-semibold text-gray-900">My Reports</h2>
                </div>
                {reports && reports.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {reports.length} report{reports.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
                </div>
              ) : reports?.length === 0 || !reports ? (
                <div className="text-center py-12 px-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No reports yet</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Use the search form to generate your first report
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {reports.map((report) => (
                    <Link
                      key={report.id}
                      to={`/report/${report.id}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {report.productName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {report.category} · {formatDate(report.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right">
                          <ScoreBadge score={report.opportunityScore} label="Opportunity" />
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
    </div>
  )
}
