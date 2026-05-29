import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import {
  getTodaysWorkout,
  getCurrentWeekNumber,
  estimateWorkoutMinutes,
  getCurrentDayOfWeek,
} from '@/lib/data/queries'
import { StatTile } from '@/components/ui/StatTile'
import { Section } from '@/components/ui/Section'
import { HomeExerciseList } from './HomeExerciseList'

const DAY_NAMES = ['', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

export default async function HomePage() {
  const [todaysData, weekNumber] = await Promise.all([
    getTodaysWorkout(),
    getCurrentWeekNumber(),
  ])

  const dayOfWeek = getCurrentDayOfWeek()
  const dayName = DAY_NAMES[dayOfWeek]

  if (!todaysData) {
    return (
      <main className="px-5 pt-6">
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
          Unable to load today&apos;s workout.
        </p>
      </main>
    )
  }

  const { workoutDay, exercises, totalSets } = todaysData

  if (workoutDay.is_rest_day) {
    return (
      <main className="px-5 pt-6 flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
          Rest day — recover and come back strong
        </p>
        <Link href="/week" className="text-body" style={{ color: 'var(--accent)' }}>
          View week
        </Link>
      </main>
    )
  }

  const estTime = estimateWorkoutMinutes(totalSets)

  return (
    <main className="px-5 pt-6 pb-4 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-label-xs uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
            {dayName} · WEEK {weekNumber}
          </p>
          <h1 className="text-h1 font-medium mt-1">{workoutDay.name}</h1>
          {workoutDay.subtitle && (
            <p className="text-body mt-0.5" style={{ color: 'var(--accent)' }}>
              {workoutDay.subtitle}
            </p>
          )}
        </div>
        <Link
          href="/week"
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent)' }}
          aria-label="View week schedule"
        >
          <CalendarDays size={18} style={{ color: 'var(--accent)' }} />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatTile label="EXERCISES" value={exercises.length} />
        <StatTile label="SETS" value={totalSets} />
        <StatTile label="EST. TIME" value={`${estTime}m`} />
      </div>

      {/* Exercise list */}
      <Section label="TODAY'S WORKOUT">
        <HomeExerciseList exercises={exercises} />
      </Section>

      {/* CTA */}
      <Link
        href={`/workout/${workoutDay.id}`}
        className="block w-full rounded-xl text-center text-base font-medium active:scale-[0.97] transition-transform px-4 py-4"
        style={{ background: 'var(--accent)', color: '#000' }}
      >
        Start workout
      </Link>
    </main>
  )
}
