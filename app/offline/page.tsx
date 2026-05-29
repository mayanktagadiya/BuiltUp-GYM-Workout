export default function OfflinePage() {
  return (
    <div
      className="flex flex-col items-center justify-center px-5 text-center gap-4"
      style={{ minHeight: '60vh' }}
    >
      <p className="text-4xl" aria-hidden="true">
        💪
      </p>
      <h1 className="text-h2 font-medium" style={{ color: 'var(--text-primary)' }}>
        You&apos;re offline
      </h1>
      <p className="text-body" style={{ color: 'var(--text-secondary)', maxWidth: '260px' }}>
        BuiltUp works offline. Your last session is cached. Reconnect to sync new changes.
      </p>
    </div>
  )
}
