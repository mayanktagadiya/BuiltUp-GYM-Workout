'use client'

import { useRef, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NumberInputProps {
  value: number
  onChange: (n: number) => void
  step?: number
  min?: number
  max?: number
  suffix?: string
  label?: string
  className?: string
}

export function NumberInput({
  value,
  onChange,
  step = 1,
  min,
  max,
  suffix,
  label,
  className,
}: NumberInputProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const clamp = (n: number) => {
    if (min !== undefined && n < min) return min
    if (max !== undefined && n > max) return max
    return n
  }

  const startEditing = () => {
    setDraft(String(value))
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const commit = () => {
    const parsed = parseFloat(draft)
    if (!isNaN(parsed)) onChange(clamp(parsed))
    setEditing(false)
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <span className="text-label-xs uppercase tracking-wide text-[var(--text-secondary)]">
          {label}
        </span>
      )}
      <div className="flex items-center gap-3 min-h-[44px]">
        <button
          onClick={() => onChange(clamp(value - step))}
          className="w-8 h-8 flex items-center justify-center rounded-md bg-[var(--surface)] [border:0.5px_solid_var(--border)] text-[var(--text-primary)] active:scale-[0.95] transition-transform"
          aria-label="Decrease"
        >
          <Minus size={14} />
        </button>

        {editing ? (
          <input
            ref={inputRef}
            type="number"
            inputMode="decimal"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
            className="w-20 text-center text-[22px] font-medium tabular-nums bg-[var(--surface)] [border:0.5px_solid_var(--accent)] rounded-md text-[var(--text-primary)] outline-none py-0.5"
          />
        ) : (
          <button
            onClick={startEditing}
            className="min-w-[80px] text-center text-[22px] font-medium tabular-nums text-[var(--text-primary)]"
            aria-label={`Current value: ${value}${suffix ?? ''}. Tap to edit.`}
          >
            <span>{value}</span>
            {suffix && (
              <span className="text-sm text-[var(--text-secondary)] ml-0.5">{suffix}</span>
            )}
          </button>
        )}

        <button
          onClick={() => onChange(clamp(value + step))}
          className="w-8 h-8 flex items-center justify-center rounded-md bg-[var(--surface)] [border:0.5px_solid_var(--border)] text-[var(--text-primary)] active:scale-[0.95] transition-transform"
          aria-label="Increase"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}
