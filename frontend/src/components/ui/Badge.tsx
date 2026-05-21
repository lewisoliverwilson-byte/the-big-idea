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

export function ScoreBadge({ score, label }: { score: number; label: string }) {
  const variant = score >= 7 ? 'green' : score >= 4 ? 'amber' : 'red'

  return (
    <div className="flex flex-col items-center">
      <Badge variant={variant} size="md" className="text-sm font-bold px-3 py-1.5">
        {score}/10
      </Badge>
      <span className="text-xs mt-1" style={{ color: '#5A4F7A' }}>{label}</span>
    </div>
  )
}
