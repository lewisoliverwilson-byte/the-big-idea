import React from 'react'
import { cn } from '../../utils/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'amber' | 'red' | 'blue' | 'gray'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'gray', size = 'md', className }: BadgeProps) {
  const variants: Record<string, React.CSSProperties> = {
    green: { background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' },
    amber: { background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' },
    red:   { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' },
    blue:  { background: '#EEF2FF', color: '#3730A3', border: '1px solid #C7D2FE' },
    gray:  { background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' },
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  }

  return (
    <span
      className={cn('inline-flex items-center font-semibold rounded-full', sizes[size], className)}
      style={variants[variant]}
    >
      {children}
    </span>
  )
}

export function ScoreBadge({ score, label, sources = [] }: {
  score: number; label: string; sources?: Array<{ label: string; value: string }>
}) {
  const variant = score >= 7 ? 'green' : score >= 4 ? 'amber' : 'red'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 110 }}>
      <Badge variant={variant} size="md" className="text-sm font-bold px-3 py-1.5">
        {score}/10
      </Badge>
      <span className="text-xs mt-1" style={{ color: '#64748B' }}>{label}</span>
      {sources.length > 0 && (
        <div style={{
          marginTop: 8,
          display: 'flex', flexDirection: 'column', gap: 3,
          width: '100%',
          background: '#F8FAFC', border: '1px solid #E2E8F0',
          borderRadius: 8, padding: '6px 10px',
        }}>
          {sources.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
              <span style={{ fontSize: 10, color: '#94A3B8', whiteSpace: 'nowrap' }}>{s.label}</span>
              <span style={{ fontSize: 10, color: '#0F172A', fontWeight: 600, textAlign: 'right' }}>{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
