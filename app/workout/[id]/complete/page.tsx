'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Flame } from 'lucide-react'
import { useWorkoutStore } from '@/lib/store/workoutStore'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { StatTile } from '@/components/ui/StatTile'

interface PREntry {
  exerciseName: string
  weight: number
  reps: number
}

interface CompletionData {
  durationSeconds: number
  workoutDayName: string
  dayOfWeekName: string
  prs: PREntry[]
  streak: { current: number; best: number }
}

const DAY_NAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function formatVolume(kg: number): string {
  return `${Math.round(kg).toLocaleString()}kg`
}

function buildStreak(completedAts: string[]): { current: number; best: number } {
  if (!completedAts.length) return { current: 0, best: 0 }

  const days = new Set(completedAts.map((d) => d.split('T')[0]))
  const sorted = Array.from(days).sort()

  let best = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.round(
      (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000
    )
    if (diff === 1) {
      run++
      if (run > best) best = run
    } else {
      run = 1
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let current = 0
  const d = new Date(today)
  while (days.has(d.toISOString().split('T')[0])) {
    current++
    d.setDate(d.getDate() - 1)
  }

  return { current, best }
}

export default function WorkoutCompletePage() {
  const router = useRouter()
  const { currentSession, exercises, setLogs, resetSession } = useWorkoutStore()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<CompletionData | null>(null)

  // Stats computed from persisted store — available immediately
  const completedSets = Object.values(setLogs).reduce(
    (sum, logs) => sum + logs.filter((l) => l.completed).length,
    0
  )
  const totalSets = exercises.reduce((sum, e) => sum + e.targetSets, 0)
  const volumeKg = Object.values(setLogs).reduce(
    (sum, logs) =>
      sum +
      logs
        .filter((l) => l.completed)
        .reduce((s, l) => s + (l.weight ?? 0) * (l.reps ?? 0), 0),
    0
  )

  useEffect(() => {
    const { id: sessionId, workoutDayId, startedAt } = currentSession

    if (!sessionId || !workoutDayId) {
      router.replace('/')
      return
    }

    const supabase = createClient()
    const sessionStartIso = startedAt
      ? new Date(startedAt).toISOString()
      : new Date(0).toISOString()

    async function load() {
      type RawSetLog = {
        id: string
        exercise_id: string
        weight_kg: number | null
        reps: number | null
        exercises: { name: string } | null
      }

      // Parallel: day name, session duration, all set_logs for this session, full history for streak
      const [dayResult, sessionResult, logsResult, historyResult] = await Promise.all([
        supabase
          .from('workout_days')
          .select('name, day_of_week')
          .eq('id', workoutDayId!)
          .single(),
        supabase
          .from('workout_sessions')
          .select('duration_seconds')
          .eq('id', sessionId!)
          .single(),
        supabase
          .from('set_logs')
          .select('id, exercise_id, weight_kg, reps, exercises(name)')
          .eq('session_id', sessionId!),
        supabase
          .from('workout_sessions')
          .select('completed_at')
          .not('completed_at', 'is', null),
      ])

      const rawLogs = (logsResult.data ?? []) as unknown as RawSetLog[]

      // PR detection: for each set, check if weight exceeds historical max at >= same reps
      const prs: PREntry[] = []
      for (const log of rawLogs) {
        if (log.weight_kg == null || log.reps == null) continue
        const weight = Number(log.weight_kg)

        const { data: prevBest } = await supabase
          .from('set_logs')
          .select('weight_kg')
          .eq('exercise_id', log.exercise_id)
          .gte('reps', log.reps)
          .lt('completed_at', sessionStartIso)
          .order('weight_kg', { ascending: false })
          .limit(1)
          .maybeSingle()

        const prevMax = prevBest?.weight_kg ? Number(prevBest.weight_kg) : 0

        if (weight > prevMax) {
          await supabase
            .from('set_logs')
            .update({ is_personal_record: true })
            .eq('id', log.id)
          prs.push({
            exerciseName: log.exercises?.name ?? 'Exercise',
            weight,
            reps: log.reps,
          })
        }
      }

      type RawDay = { name: string; day_of_week: number } | null
      const dayRow = dayResult.data as unknown as RawDay

      const durationSeconds =
        sessionResult.data?.duration_seconds ??
        (startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0)

      type RawHistory = { completed_at: string | null }
      const completedAts = ((historyResult.data ?? []) as unknown as RawHistory[])
        .map((s) => s.completed_at)
        .filter((d): d is string => d !== null)

      setData({
        durationSeconds,
        workoutDayName: dayRow?.name ?? 'Workout',
        dayOfWeekName: DAY_NAMES[dayRow?.day_of_week ?? 1] ?? 'Monday',
        prs,
        streak: buildStreak(completedAts),
      })
      setLoading(false)
    }

    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDone = () => {
    resetSession()
    router.push('/')
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
          Saving workout…
        </p>
      </main>
    )
  }

  if (!data) return null

  return (
    <main className="px-5 pt-10 pb-8 flex flex-col items-center gap-6">
      {/* Checkmark circle */}
      <div
        className="w-[60px] h-[60px] rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent)' }}
      >
        <Check size={28} strokeWidth={2.5} style={{ color: 'var(--accent)' }} />
      </div>

      {/* Title + subtitle */}
      <div className="text-center">
        <h1 className="text-[24px] font-medium tracking-tight">Workout complete</h1>
        <p className="mt-1 text-body" style={{ color: 'var(--text-secondary)' }}>
          {data.workoutDayName} · {data.dayOfWeekName}
        </p>
      </div>

      {/* 2×2 stat grid */}
      <div className="w-full grid grid-cols-2 gap-3">
        <StatTile label="DURATION" value={formatDuration(data.durationSeconds)} />
        <StatTile label="SETS DONE" value={`${completedSets}/${totalSets}`} />
        <StatTile label="VOLUME" value={formatVolume(volumeKg)} />
        <StatTile
          label="PRs HIT"
          value={data.prs.length}
          valueColor={data.prs.length > 0 ? 'accent' : 'default'}
        />
      </div>

      {/* PR card */}
      {data.prs.length > 0 && (
        <div
          className="w-full rounded-xl p-4 flex flex-col gap-3"
          style={{ border: '0.5px solid var(--accent)', background: 'var(--accent-bg)' }}
        >
          <p
            className="text-label-xs uppercase tracking-widest"
            style={{ color: 'var(--accent)' }}
          >
            NEW PERSONAL RECORDS
          </p>
          {data.prs.map((pr, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-body">{pr.exerciseName}</span>
              <span
                className="text-body font-medium tabular-nums"
                style={{ color: 'var(--accent)' }}
              >
                {pr.weight}kg × {pr.reps}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Streak section */}
      <div className="w-full">
        <p
          className="text-label-sm uppercase tracking-wide mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          STREAK
        </p>
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: 'var(--surface)', border: '0.5px solid var(--border)' }}
        >
          <Flame size={20} style={{ color: 'var(--accent)' }} />
          <div>
            <p className="text-[22px] font-medium tabular-nums leading-tight">
              {data.streak.current} {data.streak.current === 1 ? 'day' : 'days'}
            </p>
            {data.streak.current > 0 && data.streak.current === data.streak.best && (
              <p className="text-label-sm mt-0.5" style={{ color: 'var(--accent)' }}>
                Personal best
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Done */}
      <Button fullWidth size="lg" onClick={handleDone}>
        Done
      </Button>
    </main>
  )
}
