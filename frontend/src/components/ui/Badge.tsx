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
  const variants = {
    green: 'bg-green-100 text-green-800',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-700',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function ScoreBadge({ score, label }: { score: number; label: string }) {
  const variant =
    score >= 7 ? 'green' : score >= 4 ? 'amber' : 'red'

  return (
    <div className="flex flex-col items-center">
      <Badge variant={variant} size="md" className="text-sm font-bold px-3 py-1.5">
        {score}/10
      </Badge>
      <span className="text-xs text-gray-500 mt-1">{label}</span>
    </div>
  )
}
