'use client'

import { format } from 'date-fns'
import { SessionHistoryEntry } from '@/lib/data/queries'

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function SessionCard({ session }: { session: SessionHistoryEntry }) {
  const date = new Date(session.completed_at)

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2.5 active:scale-[0.98] transition-transform cursor-pointer"
      style={{ background: 'var(--surface)', border: '0.5px solid var(--border)' }}
      onClick={() => alert('Detail view coming soon')}
    >
      <div className="flex items-center justify-between">
        <p className="text-body font-medium">{session.workout_day_name}</p>
        <p className="text-label-sm" style={{ color: 'var(--text-secondary)' }}>
          {format(date, 'EEE, MMM d')}
        </p>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-label-sm" style={{ color: 'var(--text-secondary)' }}>
          {formatDuration(session.duration_seconds)}
        </span>
        <span className="text-label-sm" style={{ color: 'var(--text-secondary)' }}>
          {session.total_sets_logged} sets
        </span>
        <span className="text-label-sm" style={{ color: 'var(--text-secondary)' }}>
          {Math.round(session.total_volume_kg).toLocaleString()}kg
        </span>
        {session.pr_count > 0 && (
          <span
            className="text-label-xs uppercase tracking-wide px-1.5 py-0.5 rounded"
            style={{
              background: 'var(--accent-bg)',
              color: 'var(--accent)',
              border: '0.5px solid var(--accent)',
            }}
          >
            {session.pr_count} PR{session.pr_count > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}
