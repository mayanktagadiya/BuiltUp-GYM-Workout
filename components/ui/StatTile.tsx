import { cn } from '@/lib/utils'

interface StatTileProps {
  label: string
  value: string | number
  valueColor?: 'default' | 'accent' | 'success' | 'danger'
  className?: string
}

const valueColorMap: Record<NonNullable<StatTileProps['valueColor']>, string> = {
  default: 'var(--text-primary)',
  accent: 'var(--accent)',
  success: 'var(--success)',
  danger: 'var(--danger)',
}

export function StatTile({ label, value, valueColor = 'default', className }: StatTileProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 bg-[var(--surface)] rounded-xl p-4 [border:0.5px_solid_var(--border)]',
        className
      )}
    >
      <span className="text-label-xs uppercase tracking-wide text-[var(--text-secondary)]">
        {label}
      </span>
      <span
        className="text-[22px] font-medium tabular-nums leading-tight"
        style={{ color: valueColorMap[valueColor] }}
      >
        {value}
      </span>
    </div>
  )
}
