import React from 'react'
import { cn } from '../../utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

const CARD_STYLE: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  boxShadow: '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.07)',
}

export function Card({ children, className, style }: CardProps) {
  return (
    <div
      className={cn('rounded-xl overflow-hidden', className)}
      style={{ ...CARD_STYLE, ...style }}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, style }: CardProps) {
  return (
    <div
      className={cn('px-6 py-4 border-b border-slate-200', className)}
      style={style}
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
