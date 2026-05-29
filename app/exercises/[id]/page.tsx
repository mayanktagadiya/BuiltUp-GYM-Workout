import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  getExerciseById,
  getWorkoutDaysContainingExercise,
} from '@/lib/data/queries'
import { Pill } from '@/components/ui/Pill'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { LiteYoutubeEmbed } from '@/components/LiteYoutubeEmbed'

const DAY_NAMES: Record<number, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
}

interface Props {
  params: { id: string }
}

export default async function ExerciseDetailPage({ params }: Props) {
  const [exercise, workoutDays] = await Promise.all([
    getExerciseById(params.id),
    getWorkoutDaysContainingExercise(params.id),
  ])

  if (!exercise) notFound()

  const secondaryList = exercise.secondary_muscles
    ? exercise.secondary_muscles
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : []

  return (
    <main className="px-5 pt-4 pb-8 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/exercises"
          className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 active:scale-[0.95] transition-transform"
          style={{ background: 'var(--surface)', border: '0.5px solid var(--border)' }}
          aria-label="Back to exercises"
        >
          <ChevronLeft size={16} style={{ color: 'var(--text-primary)' }} />
        </Link>
        <h1 className="text-h1 font-medium flex-1 text-center pr-9">{exercise.name}</h1>
      </div>

      {/* Video */}
      <LiteYoutubeEmbed videoUrl={exercise.video_url} title={exercise.name} />

      {/* Muscle group pills */}
      <div className="flex flex-wrap gap-2">
        <Pill active>{exercise.muscle_group}</Pill>
        {secondaryList.map((m) => (
          <Pill key={m}>{m}</Pill>
        ))}
      </div>

      {/* Form cues */}
      {exercise.form_cues && (
        <Section label="FORM CUES">
          <p
            className="text-body"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
          >
            {exercise.form_cues}
          </p>
        </Section>
      )}

      {/* Used in */}
      {workoutDays.length > 0 && (
        <Section label="USED IN">
          <div className="flex flex-col gap-2">
            {workoutDays.map((day) => (
              <Link key={day.workoutDayId} href={`/workout/${day.workoutDayId}`}>
                <Card>
                  <div className="flex items-center justify-between">
                    <p className="text-body" style={{ color: 'var(--text-primary)' }}>
                      {DAY_NAMES[day.dayOfWeek]} · {day.name}
                    </p>
                    <ChevronRight
                      size={14}
                      style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}
                    />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Section>
      )}
    </main>
  )
}
