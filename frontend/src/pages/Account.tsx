import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { createPortalSession, deleteAccount } from '../services/api'
import { formatDate } from '../utils/formatters'
import { User, CreditCard, Trash2, Shield, Crown } from 'lucide-react'

function Section({ icon: Icon, title, children, danger = false }: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <div className={`rounded-xl border ${danger ? 'border-red-500/20' : 'border-slate-700'} overflow-hidden`}>
      <div className={`px-5 py-4 border-b ${danger ? 'border-red-500/20 bg-red-500/5' : 'border-slate-700/50 bg-slate-900'}`}>
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${danger ? 'text-red-400' : 'text-slate-400'}`} />
          <h2 className={`font-semibold text-sm ${danger ? 'text-red-400' : 'text-white'}`}>{title}</h2>
        </div>
      </div>
      <div className="px-5 py-5 bg-slate-900">
        {children}
      </div>
    </div>
  )
}

export function Account() {
  const { user, signOut } = useAuthStore()
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

  const isPro = user?.subscriptionStatus === 'active'

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-5">
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>

        {/* Profile */}
        <Section icon={User} title="Profile">
          <div className="space-y-3">
            {[
              { label: 'Full name', value: user?.fullName || '—' },
              { label: 'Email', value: user?.email },
              { label: 'Member since', value: user?.createdAt ? formatDate(user.createdAt) : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm border-b border-slate-800 pb-3 last:border-0">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-white">{value}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Subscription */}
        <Section icon={CreditCard} title="Subscription">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-slate-500 mb-2">Current plan</p>
              {isPro ? (
                <span className="inline-flex items-center gap-1.5 bg-amber-400/10 text-amber-400 border border-amber-400/30 text-sm font-semibold px-3 py-1 rounded-full">
                  <Crown className="h-3.5 w-3.5" />
                  Pro — Active
                </span>
              ) : user?.subscriptionStatus === 'cancelled' ? (
                <span className="inline-flex text-sm text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">Cancelled</span>
              ) : user?.subscriptionStatus === 'past_due' ? (
                <span className="inline-flex text-sm text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-1 rounded-full">Past Due</span>
              ) : (
                <span className="inline-flex text-sm text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full">Free</span>
              )}
            </div>
            {!isPro && (
              <Link
                to="/pricing"
                className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2 rounded-full text-sm transition-colors"
              >
                <Crown className="h-3.5 w-3.5" />
                Upgrade to Pro
              </Link>
            )}
          </div>

          {isPro ? (
            <div className="space-y-3">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-sm">
                <p className="text-slate-400">
                  Weekly ideas used:{' '}
                  <span className="text-white font-semibold">{user?.proReportsUsedThisWeek || 0} / 20</span>
                </p>
              </div>
              <button
                onClick={() => portalMutation.mutate()}
                disabled={portalMutation.isPending}
                className="flex items-center gap-2 text-sm text-amber-400 hover:underline disabled:opacity-50"
              >
                {portalMutation.isPending ? (
                  <div className="h-3 w-3 border border-amber-400 border-t-transparent rounded-full animate-spin" />
                ) : null}
                Manage billing in Stripe →
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              {Math.max(0, 2 - (user?.reportsUsedFree || 0))} of 2 free ideas remaining.
            </p>
          )}
        </Section>

        {/* Security */}
        <Section icon={Shield} title="Security">
          <button
            className="text-sm text-slate-400 hover:text-white transition-colors underline"
            onClick={async () => {
              await signOut()
              navigate('/')
            }}
          >
            Sign out of all devices
          </button>
        </Section>

        {/* Danger Zone */}
        <Section icon={Trash2} title="Danger Zone" danger>
          <p className="text-sm text-slate-400 mb-4">
            Permanently delete your account and all data. This cannot be undone.
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-sm text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 px-4 py-2 rounded-lg transition-colors"
            >
              Delete account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-red-400">
                Are you absolutely sure? All your reports will be permanently deleted.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="flex items-center gap-2 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleteMutation.isPending ? (
                    <div className="h-3 w-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : null}
                  Yes, delete my account
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}
