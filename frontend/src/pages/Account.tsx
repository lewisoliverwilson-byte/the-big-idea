import { useState } from 'react'
import type { ReactNode, CSSProperties } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { createPortalSession, deleteAccount } from '../services/api'
import { formatDate } from '../utils/formatters'
import { TrendingUp } from 'lucide-react'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:      '#F8FAFC',
  white:   '#FFFFFF',
  border:  '#E2E8F0',
  text:    '#0F172A',
  textSec: '#475569',
  textMut: '#94A3B8',
  primary: '#4F46E5',
}

const CARD: CSSProperties = {
  background:   C.white,
  border:       `1px solid ${C.border}`,
  borderRadius: 12,
  overflow:     'hidden',
  boxShadow:    '0 1px 3px rgba(0,0,0,0.06)',
  marginBottom: 16,
}

function Section({ icon, title, children, danger = false }: {
  icon:     string
  title:    string
  children: ReactNode
  danger?:  boolean
}) {
  return (
    <div style={{
      ...CARD,
      border: danger ? '1px solid #FECACA' : `1px solid ${C.border}`,
    }}>
      <div style={{
        padding:     '12px 18px',
        borderBottom: danger ? '1px solid #FEE2E2' : `1px solid ${C.border}`,
        background:  danger ? '#FFF5F5' : '#FAFAFA',
        display:     'flex',
        alignItems:  'center',
        gap:         8,
      }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <h2 style={{
          fontSize:   13,
          fontWeight: 600,
          color:      danger ? '#DC2626' : C.text,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          {title}
        </h2>
      </div>
      <div style={{ padding: '18px' }}>
        {children}
      </div>
    </div>
  )
}

export function Account() {
  const { user, signOut }    = useAuthStore()
  const navigate             = useNavigate()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const portalMutation = useMutation({
    mutationFn: createPortalSession,
    onSuccess: (data) => { window.location.href = data.url },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      await signOut()
      navigate('/')
    },
  })

  const isPro = user?.subscriptionStatus === 'active'

  const rowStyle = {
    display:        'flex',
    justifyContent: 'space-between',
    fontSize:       13,
    paddingBottom:  10,
    borderBottom:   `1px solid ${C.border}`,
    marginBottom:   10,
    fontFamily:     'Inter, system-ui, sans-serif',
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '36px 20px' }}>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 24, letterSpacing: '-0.02em' }}>
          Account Settings
        </h1>

        {/* Profile */}
        <Section icon="👤" title="Profile">
          {[
            { label: 'Full name',    value: user?.fullName || '—' },
            { label: 'Email',        value: user?.email || '—' },
            { label: 'Member since', value: user?.createdAt ? formatDate(user.createdAt) : '—' },
          ].map(({ label, value }) => (
            <div key={label} style={rowStyle}>
              <span style={{ color: C.textSec }}>{label}</span>
              <span style={{ fontWeight: 600, color: C.text }}>{value}</span>
            </div>
          ))}
        </Section>

        {/* Subscription */}
        <Section icon="⚡" title="Subscription">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 11, color: C.textMut, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Current plan
              </p>
              {isPro ? (
                <span style={{
                  display:    'inline-flex',
                  alignItems: 'center',
                  gap:        6,
                  background: '#EEF2FF',
                  border:     '1px solid #C7D2FE',
                  borderRadius: 99,
                  padding:    '5px 14px',
                  fontSize:   13,
                  fontWeight: 700,
                  color:      '#4F46E5',
                }}>
                  <TrendingUp size={13} />
                  Pro — Active
                </span>
              ) : user?.subscriptionStatus === 'cancelled' ? (
                <span style={{ fontSize: 13, color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 99, padding: '5px 14px' }}>
                  Cancelled
                </span>
              ) : user?.subscriptionStatus === 'past_due' ? (
                <span style={{ fontSize: 13, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 99, padding: '5px 14px' }}>
                  Past Due
                </span>
              ) : (
                <span style={{ fontSize: 13, color: C.textSec, background: '#F1F5F9', border: `1px solid ${C.border}`, borderRadius: 99, padding: '5px 14px' }}>
                  Free
                </span>
              )}
            </div>
            {!isPro && (
              <Link
                to="/pricing"
                style={{
                  display:        'inline-flex',
                  alignItems:     'center',
                  gap:            6,
                  background:     C.primary,
                  borderRadius:   7,
                  padding:        '7px 16px',
                  color:          '#fff',
                  fontSize:       12,
                  fontWeight:     600,
                  textDecoration: 'none',
                  transition:     'background 0.12s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#4338CA')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = C.primary)}
              >
                Upgrade to Pro
              </Link>
            )}
          </div>

          {isPro ? (
            <div>
              <div style={{
                background:   '#F8FAFC',
                border:       `1px solid ${C.border}`,
                borderRadius: 8,
                padding:      '10px 14px',
                fontSize:     13,
                color:        C.textSec,
                marginBottom: 12,
              }}>
                Weekly reports used:{' '}
                <span style={{ fontWeight: 700, color: C.text }}>
                  {user?.proReportsUsedThisWeek || 0} / 20
                </span>
              </div>
              <button
                onClick={() => portalMutation.mutate()}
                disabled={portalMutation.isPending}
                style={{
                  background:     'none',
                  border:         'none',
                  cursor:         portalMutation.isPending ? 'not-allowed' : 'pointer',
                  fontSize:       13,
                  color:          C.primary,
                  display:        'flex',
                  alignItems:     'center',
                  gap:            6,
                  opacity:        portalMutation.isPending ? 0.6 : 1,
                  textDecoration: 'underline',
                  padding:        0,
                }}
              >
                {portalMutation.isPending && (
                  <div style={{
                    width:          12,
                    height:         12,
                    border:         `1.5px solid rgba(79,70,229,0.2)`,
                    borderTopColor: C.primary,
                    borderRadius:   '50%',
                    animation:      'spin 0.9s linear infinite',
                  }} />
                )}
                Manage billing in Stripe →
              </button>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: C.textSec }}>
              {Math.max(0, 2 - (user?.reportsUsedFree || 0))} of 2 free reports remaining.
            </p>
          )}
        </Section>

        {/* Security */}
        <Section icon="🛡️" title="Security">
          <button
            style={{
              background:     'none',
              border:         'none',
              cursor:         'pointer',
              fontSize:       13,
              color:          C.textSec,
              textDecoration: 'underline',
              transition:     'color 0.15s',
              padding:        0,
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = C.text)}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = C.textSec)}
            onClick={async () => {
              await signOut()
              navigate('/')
            }}
          >
            Sign out of all devices
          </button>
        </Section>

        {/* Danger Zone */}
        <Section icon="🗑️" title="Danger Zone" danger>
          <p style={{ fontSize: 13, color: C.textSec, marginBottom: 16 }}>
            Permanently delete your account and all data. This cannot be undone.
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                fontSize:    13,
                color:       '#DC2626',
                background:  'none',
                border:      '1px solid #FECACA',
                borderRadius: 7,
                padding:     '7px 16px',
                cursor:      'pointer',
                transition:  'border-color 0.15s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = '#FCA5A5')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = '#FECACA')}
            >
              Delete account
            </button>
          ) : (
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', marginBottom: 12 }}>
                Are you absolutely sure? All your reports will be permanently deleted.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  style={{
                    display:    'flex',
                    alignItems: 'center',
                    gap:        6,
                    fontSize:   13,
                    color:      '#DC2626',
                    background: '#FEF2F2',
                    border:     '1px solid #FECACA',
                    borderRadius: 7,
                    padding:    '7px 16px',
                    cursor:     deleteMutation.isPending ? 'not-allowed' : 'pointer',
                    opacity:    deleteMutation.isPending ? 0.6 : 1,
                  }}
                >
                  {deleteMutation.isPending && (
                    <div style={{ width: 12, height: 12, border: '1.5px solid #FECACA', borderTopColor: '#DC2626', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
                  )}
                  Yes, delete my account
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: C.textSec }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Section>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
