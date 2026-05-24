import Link from 'next/link'
import { ArrowLeft, MoreVertical, ChevronRight } from 'lucide-react'
import {
  getWeekWorkouts,
  getCurrentWeekNumber,
  getCurrentDayOfWeek,
  estimateWorkoutMinutes,
} from '@/lib/data/queries'
import { Card } from '@/components/ui/Card'

const DAY_LABELS = ['', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export default async function WeekPage() {
  const [weekDays, weekNumber] = await Promise.all([
    getWeekWorkouts(),
    getCurrentWeekNumber(),
  ])

  const todayDow = getCurrentDayOfWeek()

  return (
    <main className="px-5 pt-6 pb-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/" className="w-9 h-9 flex items-center justify-center">
          <ArrowLeft size={20} style={{ color: 'var(--text-primary)' }} />
        </Link>
        <h2 className="text-h3 font-medium">Week {weekNumber}</h2>
        <button
          className="w-9 h-9 flex items-center justify-center"
          aria-label="More options"
        >
          <MoreVertical size={20} style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>

      {/* Days list */}
      <div className="flex flex-col gap-3">
        {weekDays.map((day) => {
          const isToday = day.day_of_week === todayDow
          const label = DAY_LABELS[day.day_of_week]
          const estTime = estimateWorkoutMinutes(day.total_sets)

          if (day.is_rest_day) {
            return (
              <Card key={day.id} className="opacity-60">
                <div>
                  <p className="text-label-xs uppercase" style={{ color: 'var(--text-secondary)' }}>
                    {label}
                  </p>
                  <p className="text-body font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    Rest day
                  </p>
                </div>
              </Card>
            )
          }

          if (isToday) {
            return (
              <Link
                key={day.id}
                href={`/workout/${day.id}`}
                className="block active:scale-[0.98] transition-transform"
              >
                <Card active>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
                          style={{ background: 'var(--accent)' }}
                        />
                        <p className="text-label-xs uppercase" style={{ color: 'var(--accent)' }}>
                          {label} · TODAY
                        </p>
                      </div>
                      <p className="text-body font-medium mt-1 truncate" style={{ color: 'var(--text-primary)' }}>
                        {day.name}
                      </p>
                      <p className="text-label-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {day.exercise_count} exercises · {estTime}m
                      </p>
                    </div>
                    <ChevronRight size={18} className="flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                </Card>
              </Link>
            )
          }

          return (
            <Link
              key={day.id}
              href={`/workout/${day.id}`}
              className="block active:scale-[0.98] transition-transform"
            >
              <Card>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-label-xs uppercase" style={{ color: 'var(--text-secondary)' }}>
                      {label}
                    </p>
                    <p className="text-body font-medium mt-0.5 truncate" style={{ color: 'var(--text-primary)' }}>
                      {day.name}
                    </p>
                    <p className="text-label-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {day.exercise_count} exercises · {estTime}m
                    </p>
                  </div>
                  <ChevronRight size={18} className="flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
