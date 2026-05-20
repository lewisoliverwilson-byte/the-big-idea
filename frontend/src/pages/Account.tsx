import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { createPortalSession, deleteAccount } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { formatDate } from '../utils/formatters'
import { User, CreditCard, Trash2, Shield } from 'lucide-react'

export function Account() {
  const { user } = useAuthStore()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const portalMutation = useMutation({
    mutationFn: createPortalSession,
    onSuccess: (data) => {
      window.location.href = data.url
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      await signOut()
      navigate('/')
    },
  })

  const statusBadge = () => {
    switch (user?.subscriptionStatus) {
      case 'active': return <Badge variant="green">Pro — Active</Badge>
      case 'cancelled': return <Badge variant="amber">Cancelled</Badge>
      case 'past_due': return <Badge variant="red">Past Due</Badge>
      default: return <Badge variant="gray">Free</Badge>
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Profile</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {[
              { label: 'Full name', value: user?.fullName || '—' },
              { label: 'Email', value: user?.email },
              { label: 'Member since', value: user?.createdAt ? formatDate(user.createdAt) : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm border-b border-gray-100 pb-3 last:border-0">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Subscription</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current plan</p>
              {statusBadge()}
            </div>
            {user?.subscriptionStatus === 'free' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/pricing')}
              >
                Upgrade to Pro
              </Button>
            )}
          </div>

          {user?.subscriptionStatus !== 'free' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => portalMutation.mutate()}
              isLoading={portalMutation.isPending}
            >
              Manage billing in Stripe →
            </Button>
          )}

          {user?.subscriptionStatus === 'free' && (
            <p className="text-sm text-gray-500">
              {Math.max(0, 2 - (user.reportsUsedFree || 0))} of 2 free reports remaining.
            </p>
          )}
        </CardBody>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Security</h2>
          </div>
        </CardHeader>
        <CardBody>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await signOut()
              navigate('/')
            }}
          >
            Sign out of all devices
          </Button>
        </CardBody>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader className="border-red-100">
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-red-500" />
            <h2 className="font-semibold text-red-700">Danger Zone</h2>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-gray-600 mb-4">
            Permanently delete your account and all data. This action cannot be undone.
          </p>
          {!showDeleteConfirm ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete account
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-red-700">
                Are you absolutely sure? This will delete all your reports permanently.
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => deleteMutation.mutate()}
                  isLoading={deleteMutation.isPending}
                >
                  Yes, delete my account
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
