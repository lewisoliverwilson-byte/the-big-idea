import React from 'react'
import { cn } from '../../utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

const GLASS: React.CSSProperties = {
  background:           'rgba(14,10,28,0.80)',
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border:               '1px solid rgba(139,92,246,0.15)',
  boxShadow:            '0 0 0 1px rgba(139,92,246,0.06), 0 16px 32px rgba(0,0,0,0.5)',
}

export function Card({ children, className, style }: CardProps) {
  return (
    <div
      className={cn('rounded-2xl overflow-hidden', className)}
      style={{ ...GLASS, ...style }}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, style }: CardProps) {
  return (
    <div
      className={cn('px-6 py-4 border-b', className)}
      style={{ borderColor: 'rgba(139,92,246,0.15)', ...style }}
    >
      {children}
    </div>
  )
}

export function CardBody({ children, className, style }: CardProps) {
  return (
    <div className={cn('px-6 py-5', className)} style={style}>
      {children}
    </div>
  )
}
