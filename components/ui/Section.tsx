interface SectionProps {
  label: string
  children: React.ReactNode
}

export function Section({ label, children }: SectionProps) {
  return (
    <section>
      <p className="text-label-sm uppercase tracking-wide text-[var(--text-secondary)] mb-3">
        {label}
      </p>
      {children}
    </section>
  )
}
