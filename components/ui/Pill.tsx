'use client'

import { cn } from '@/lib/utils'

interface PillProps {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
}

export function Pill({ children, active, onClick }: PillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs transition-all',
        active
          ? 'bg-[var(--accent)] text-black border border-transparent'
          : 'bg-[var(--surface)] text-[var(--text-primary)] [border:0.5px_solid_var(--border)]'
      )}
    >
      {children}
    </button>
  )
}
