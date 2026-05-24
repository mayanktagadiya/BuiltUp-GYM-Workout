import { format, startOfWeek, isSameWeek } from 'date-fns'
import { Dumbbell } from 'lucide-react'
import { getSessionHistory, SessionHistoryEntry } from '@/lib/data/queries'
import { SessionCard } from './SessionCard'

type WeekGroup = {
  weekLabel: string
  weekDate: Date
  sessions: SessionHistoryEntry[]
}

function groupByWeek(sessions: SessionHistoryEntry[]): WeekGroup[] {
  const groups: WeekGroup[] = []
  let currentGroup: WeekGroup | null = null

  for (const session of sessions) {
    const date = new Date(session.completed_at)
    if (!currentGroup || !isSameWeek(date, currentGroup.weekDate, { weekStartsOn: 1 })) {
      currentGroup = {
        weekLabel: `Week of ${format(startOfWeek(date, { weekStartsOn: 1 }), 'MMM d')}`,
        weekDate: date,
        sessions: [],
      }
      groups.push(currentGroup)
    }
    currentGroup.sessions.push(session)
  }

  return groups
}

export default async function HistoryPage() {
  const sessions = await getSessionHistory()

  if (sessions.length === 0) {
    return (
      <main className="px-5 pt-8 pb-8">
        <h1 className="text-h1 font-medium mb-8">History</h1>
        <div className="flex flex-col items-center justify-center gap-3 pt-16 text-center">
          <Dumbbell size={36} style={{ color: 'var(--text-tertiary)' }} />
          <p className="text-body font-medium">No workouts logged yet</p>
          <p className="text-body mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Start your first workout on the Today tab
          </p>
        </div>
      </main>
    )
  }

  const weeks = groupByWeek(sessions)

  return (
    <main className="px-5 pt-8 pb-8 flex flex-col gap-6">
      <h1 className="text-h1 font-medium">History</h1>

      {weeks.map((week) => (
        <div key={week.weekLabel} className="flex flex-col gap-3">
          <p
            className="text-label-xs uppercase tracking-wide"
            style={{ color: 'var(--text-secondary)' }}
          >
            {week.weekLabel}
          </p>
          {week.sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ))}
    </main>
  )
}
