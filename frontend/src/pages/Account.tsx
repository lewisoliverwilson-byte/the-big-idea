import { useState } from 'react'
import type { ReactNode, CSSProperties } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { createPortalSession, deleteAccount } from '../services/api'
import { formatDate } from '../utils/formatters'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:      '#070511',
  border:  'rgba(139,92,246,0.15)',
  text:    '#F0EEFF',
  textDim: '#9B8ECF',
  textMut: '#5A4F7A',
}
const GRAD = 'linear-gradient(135deg, #C084FC 0%, #818CF8 50%, #22D3EE 100%)'
const GBTN = 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)'
const GLASS: CSSProperties = {
  background:           'rgba(14,10,28,0.80)',
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border:               `1px solid ${C.border}`,
  borderRadius:         16,
  overflow:             'hidden',
}

// Deterministic stars
const STARS = Array.from({ length: 20 }, (_, i) => {
  const g = 137.508
  return {
    left:  `${((i * g)        % 100).toFixed(1)}%`,
    top:   `${((i * g * 0.61) % 100).toFixed(1)}%`,
    size:  [1, 1, 1.5][i % 3],
    delay: `${((i * 0.37) % 4.5).toFixed(2)}s`,
    dur:   `${(2.8 + (i % 6) * 0.45).toFixed(1)}s`,
  }
})

function Section({ icon, title, children, danger = false }: {
  icon:     string
  title:    string
  children: ReactNode
  danger?:  boolean
}) {
  return (
    <div style={{
      ...GLASS,
      border: danger ? '1px solid rgba(248,113,113,0.2)' : `1px solid ${C.border}`,
      marginBottom: 16,
    }}>
      <div style={{
        padding:     '14px 20px',
        borderBottom: danger ? '1px solid rgba(248,113,113,0.15)' : `1px solid ${C.border}`,
        background:   danger ? 'rgba(248,113,113,0.05)' : 'rgba(139,92,246,0.04)',
        display:     'flex',
        alignItems:  'center',
        gap:         8,
      }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: danger ? '#F87171' : C.text }}>{title}</h2>
      </div>
      <div style={{ padding: '20px' }}>
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
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, position: 'relative', overflow: 'hidden' }}>

      {/* Starfield */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {STARS.map((s, i) => (
          <div key={i} className="animate-twinkle" style={{
            position:          'absolute',
            left:              s.left,
            top:               s.top,
            width:             s.size,
            height:            s.size,
            borderRadius:      '50%',
            background:        i % 2 === 0 ? '#A78BFA' : '#22D3EE',
            animationDelay:    s.delay,
            animationDuration: s.dur,
          }} />
        ))}
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 24 }}>Account Settings</h1>

        {/* Profile */}
        <Section icon="👤" title="Profile">
          {[
            { label: 'Full name',    value: user?.fullName || '—' },
            { label: 'Email',        value: user?.email || '—' },
            { label: 'Member since', value: user?.createdAt ? formatDate(user.createdAt) : '—' },
          ].map(({ label, value }) => (
            <div key={label} style={rowStyle}>
              <span style={{ color: C.textDim }}>{label}</span>
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
                  background: GRAD,
                  borderRadius: 99,
                  padding:    '6px 16px',
                  fontSize:   13,
                  fontWeight: 700,
                  color:      '#fff',
                }}>
                  ✦ Sorcerer — Active
                </span>
              ) : user?.subscriptionStatus === 'cancelled' ? (
                <span style={{ fontSize: 13, color: '#FBBF24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 99, padding: '6px 14px' }}>
                  Cancelled
                </span>
              ) : user?.subscriptionStatus === 'past_due' ? (
                <span style={{ fontSize: 13, color: '#F87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 99, padding: '6px 14px' }}>
                  Past Due
                </span>
              ) : (
                <span style={{ fontSize: 13, color: C.textDim, background: 'rgba(90,79,122,0.2)', border: `1px solid ${C.border}`, borderRadius: 99, padding: '6px 14px' }}>
                  Apprentice (Free)
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
                  background:     GBTN,
                  border:         '1px solid rgba(139,92,246,0.4)',
                  borderRadius:   99,
                  padding:        '8px 18px',
                  color:          '#fff',
                  fontSize:       12,
                  fontWeight:     700,
                  textDecoration: 'none',
                }}
              >
                ✦ Upgrade
              </Link>
            )}
          </div>

          {isPro ? (
            <div>
              <div style={{
                background:   'rgba(139,92,246,0.06)',
                border:       `1px solid ${C.border}`,
                borderRadius: 10,
                padding:      '10px 14px',
                fontSize:     13,
                color:        C.textDim,
                marginBottom: 12,
              }}>
                Weekly ideas used:{' '}
                <span style={{ fontWeight: 700, color: C.text }}>
                  {user?.proReportsUsedThisWeek || 0} / 20
                </span>
              </div>
              <button
                onClick={() => portalMutation.mutate()}
                disabled={portalMutation.isPending}
                style={{
                  background:  'none',
                  border:      'none',
                  cursor:      portalMutation.isPending ? 'not-allowed' : 'pointer',
                  fontSize:    13,
                  color:       '#A78BFA',
                  display:     'flex',
                  alignItems:  'center',
                  gap:         6,
                  opacity:     portalMutation.isPending ? 0.6 : 1,
                  textDecoration: 'underline',
                }}
              >
                {portalMutation.isPending && (
                  <div style={{
                    width:        12,
                    height:       12,
                    border:       '1.5px solid rgba(167,139,250,0.3)',
                    borderTopColor: '#A78BFA',
                    borderRadius: '50%',
                    animation:    'spin 0.9s linear infinite',
                  }} />
                )}
                Manage billing in Stripe →
              </button>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: C.textDim }}>
              {Math.max(0, 2 - (user?.reportsUsedFree || 0))} of 2 free spells remaining.
            </p>
          )}
        </Section>

        {/* Security */}
        <Section icon="🛡️" title="Security">
          <button
            style={{
              background:  'none',
              border:      'none',
              cursor:      'pointer',
              fontSize:    13,
              color:       C.textDim,
              textDecoration: 'underline',
              transition:  'color 0.15s',
              padding:     0,
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = C.text)}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = C.textDim)}
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
          <p style={{ fontSize: 13, color: C.textDim, marginBottom: 16 }}>
            Permanently delete your account and all data. This cannot be undone.
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                fontSize:    13,
                color:       '#F87171',
                background:  'none',
                border:      '1px solid rgba(248,113,113,0.3)',
                borderRadius: 8,
                padding:     '8px 16px',
                cursor:      'pointer',
                transition:  'border-color 0.15s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(248,113,113,0.6)')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(248,113,113,0.3)')}
            >
              Delete account
            </button>
          ) : (
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#F87171', marginBottom: 12 }}>
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
                    color:      '#F87171',
                    background: 'rgba(248,113,113,0.1)',
                    border:     '1px solid rgba(248,113,113,0.3)',
                    borderRadius: 8,
                    padding:    '8px 16px',
                    cursor:     deleteMutation.isPending ? 'not-allowed' : 'pointer',
                    opacity:    deleteMutation.isPending ? 0.6 : 1,
                  }}
                >
                  {deleteMutation.isPending && (
                    <div style={{ width: 12, height: 12, border: '1.5px solid rgba(248,113,113,0.3)', borderTopColor: '#F87171', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
                  )}
                  Yes, delete my account
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: C.textDim }}
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
