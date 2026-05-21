interface ProgressBarProps {
  value: number
  color?: string
}

export function ProgressBar({ value, color = 'var(--accent)' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className="h-1 w-full rounded-full bg-[var(--surface)]">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  )
}
