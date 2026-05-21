'use client'

import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  active?: boolean
  onClick?: () => void
}

export function Card({ children, className, active, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-4',
        active
          ? 'bg-[var(--accent-bg)] [border:0.5px_solid_var(--accent)]'
          : 'bg-[var(--surface)] [border:0.5px_solid_var(--border)]',
        onClick && 'cursor-pointer active:scale-[0.98] transition-transform',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
