import React from 'react'
import { cn } from '../../utils/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'amber' | 'red' | 'blue' | 'gray'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({
  children,
  variant = 'gray',
  size = 'md',
  className,
}: BadgeProps) {
  const variants: Record<string, React.CSSProperties> = {
    green: { background: 'rgba(52,211,153,0.15)', color: '#34D399',  border: '1px solid rgba(52,211,153,0.3)'  },
    amber: { background: 'rgba(251,191,36,0.12)',  color: '#FBBF24',  border: '1px solid rgba(251,191,36,0.25)' },
    red:   { background: 'rgba(248,113,113,0.12)', color: '#F87171',  border: '1px solid rgba(248,113,113,0.3)' },
    blue:  { background: 'rgba(139,92,246,0.15)',  color: '#A78BFA',  border: '1px solid rgba(139,92,246,0.3)'  },
    gray:  { background: 'rgba(90,79,122,0.25)',   color: '#9B8ECF',  border: '1px solid rgba(139,92,246,0.2)'  },
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        sizes[size],
        className,
      )}
      style={variants[variant]}
    >
      {children}
    </span>
  )
}

export function ScoreBadge({
  score,
  label,
  sources = [],
}: {
  score: number
  label: string
  sources?: Array<{ label: string; value: string }>
}) {
  const variant = score >= 7 ? 'green' : score >= 4 ? 'amber' : 'red'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 110 }}>
      <Badge variant={variant} size="md" className="text-sm font-bold px-3 py-1.5">
        {score}/10
      </Badge>
      <span className="text-xs mt-1" style={{ color: '#5A4F7A' }}>{label}</span>
      {sources.length > 0 && (
        <div style={{
          marginTop: 8,
          display: 'flex', flexDirection: 'column', gap: 3,
          width: '100%',
          background: 'rgba(139,92,246,0.04)',
          border: '1px solid rgba(139,92,246,0.12)',
          borderRadius: 8,
          padding: '6px 10px',
        }}>
          {sources.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
              <span style={{ fontSize: 10, color: '#5A4F7A', whiteSpace: 'nowrap' }}>{s.label}</span>
              <span style={{ fontSize: 10, color: '#F0EEFF', fontWeight: 600, textAlign: 'right' }}>{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
