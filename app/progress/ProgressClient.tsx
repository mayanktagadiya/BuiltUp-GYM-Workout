'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { Search, ChevronDown, TrendingUp } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Card } from '@/components/ui/Card'
import { StatTile } from '@/components/ui/StatTile'
import { Pill } from '@/components/ui/Pill'
import { ExercisePickerSheet } from '@/components/ExercisePickerSheet'
import type {
  ExerciseBasic,
  ExerciseGroup,
  ExerciseProgressPoint,
  ExerciseStats,
} from '@/lib/data/queries'

const MUSCLE_GROUPS = ['All', 'Back', 'Chest', 'Legs', 'Arms', 'Shoulders', 'Core'] as const
type MuscleFilter = (typeof MUSCLE_GROUPS)[number]

interface ProgressClientProps {
  exerciseGroups: ExerciseGroup[]
  defaultExercise: ExerciseBasic | null
  initialProgressData: ExerciseProgressPoint[]
  initialStats: ExerciseStats
}

// ─── Client-side query helpers ────────────────────────────────────────────────

async function clientFetchProgressData(exerciseId: string): Promise<ExerciseProgressPoint[]> {
  const supabase = createClient()

  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('id, started_at')
    .not('completed_at', 'is', null)
    .order('started_at', { ascending: true })

  if (!sessions || sessions.length === 0) return []

  const sessionIds = sessions.map((s) => s.id)
  const sessionDateMap = new Map(sessions.map((s) => [s.id, s.started_at.split('T')[0]]))

  const { data: logs } = await supabase
    .from('set_logs')
    .select('session_id, weight_kg, reps')
    .eq('exercise_id', exerciseId)
    .in('session_id', sessionIds)

  if (!logs || logs.length === 0) return []

  const bySession = new Map<string, { date: string; topWeight: number; topReps: number }>()

  for (const log of logs) {
    const date = sessionDateMap.get(log.session_id)!
    const weight = Number(log.weight_kg ?? 0)
    const reps = Number(log.reps ?? 0)

    if (!bySession.has(log.session_id)) {
      bySession.set(log.session_id, { date, topWeight: weight, topReps: reps })
    } else {
      const ex = bySession.get(log.session_id)!
      if (weight > ex.topWeight) {
        ex.topWeight = weight
        ex.topReps = reps
      }
    }
  }

  const entries = Array.from(bySession.values()).sort((a, b) => a.date.localeCompare(b.date))
  if (entries.length === 0) return []

  const firstDate = new Date(entries[0].date)

  return entries.map((entry) => {
    const weekNum =
      Math.floor(
        (new Date(entry.date).getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      ) + 1
    return {
      date: entry.date,
      weekLabel: `W${weekNum}`,
      topSetWeight: entry.topWeight,
      topSetReps: entry.topReps,
      estimated1RM: Math.round(entry.topWeight * (1 + entry.topReps / 30) * 10) / 10,
    }
  })
}

async function clientFetchStats(exerciseId: string): Promise<ExerciseStats> {
  const supabase = createClient()

  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('id, started_at')
    .not('completed_at', 'is', null)
    .order('started_at', { ascending: false })

  if (!sessions || sessions.length === 0) {
    return { current: null, best: null, deltaLast30Days: null }
  }

  const sessionIds = sessions.map((s) => s.id)

  const { data: logs } = await supabase
    .from('set_logs')
    .select('session_id, weight_kg, reps')
    .eq('exercise_id', exerciseId)
    .in('session_id', sessionIds)

  if (!logs || logs.length === 0) {
    return { current: null, best: null, deltaLast30Days: null }
  }

  const logsBySession = new Map<string, { weight: number; reps: number }[]>()
  for (const log of logs) {
    if (!logsBySession.has(log.session_id)) logsBySession.set(log.session_id, [])
    logsBySession.get(log.session_id)!.push({
      weight: Number(log.weight_kg ?? 0),
      reps: log.reps ?? 0,
    })
  }

  const mostRecentId = sessions.map((s) => s.id).find((id) => logsBySession.has(id))
  let current: { weight: number; reps: number } | null = null
  if (mostRecentId) {
    const sl = logsBySession.get(mostRecentId)!
    current = sl.reduce((b, l) => (l.weight >= b.weight ? l : b), sl[0])
  }

  let best: { weight: number; reps: number } | null = null
  let bestWeight = 0
  for (const sl of Array.from(logsBySession.values())) {
    for (const l of sl) {
      if (l.weight > bestWeight) {
        bestWeight = l.weight
        best = l
      }
    }
  }

  let deltaLast30Days: number | null = null
  if (current !== null) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const oldId = sessions
      .filter((s) => new Date(s.started_at) <= cutoff)
      .map((s) => s.id)
      .find((id) => logsBySession.has(id))
    if (oldId) {
      const oldTop = logsBySession.get(oldId)!.reduce((max, l) => Math.max(max, l.weight), 0)
      deltaLast30Days = Math.round((current.weight - oldTop) * 10) / 10
    }
  }

  return { current, best, deltaLast30Days }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProgressClient({
  exerciseGroups,
  defaultExercise,
  initialProgressData,
  initialStats,
}: ProgressClientProps) {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseBasic | null>(defaultExercise)
  const [filterMuscleGroup, setFilterMuscleGroup] = useState<MuscleFilter>('All')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [progressData, setProgressData] = useState<ExerciseProgressPoint[]>(initialProgressData)
  const [stats, setStats] = useState<ExerciseStats>(initialStats)
  const [loading, setLoading] = useState(false)

  const loadExerciseData = useCallback(async (exerciseId: string) => {
    setLoading(true)
    const [pd, st] = await Promise.all([
      clientFetchProgressData(exerciseId),
      clientFetchStats(exerciseId),
    ])
    setProgressData(pd)
    setStats(st)
    setLoading(false)
  }, [])

  const handleSelectExercise = useCallback(
    (exercise: ExerciseBasic) => {
      setSelectedExercise(exercise)
      setPickerOpen(false)
      loadExerciseData(exercise.id)
    },
    [loadExerciseData]
  )

  const deltaDisplay =
    stats.deltaLast30Days === null
      ? '—'
      : `${stats.deltaLast30Days >= 0 ? '+' : ''}${stats.deltaLast30Days}kg`

  const deltaColor: 'success' | 'danger' | 'default' =
    stats.deltaLast30Days === null ? 'default' : stats.deltaLast30Days >= 0 ? 'success' : 'danger'

  const recentSessions = [...progressData].reverse().slice(0, 5)

  const renderDot = useCallback(
    (props: Record<string, unknown>) => {
      const cx = (props.cx as number) ?? 0
      const cy = (props.cy as number) ?? 0
      const index = (props.index as number) ?? 0
      const isLast = index === progressData.length - 1
      return (
        <circle
          key={index}
          cx={cx}
          cy={cy}
          r={3}
          fill={isLast ? 'var(--accent)' : 'transparent'}
          stroke="var(--accent)"
          strokeWidth={1.5}
        />
      )
    },
    [progressData.length]
  )

  return (
    <main className="px-5 pt-8 pb-8 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-h1 font-medium">Progress</h1>
        <TrendingUp size={20} style={{ color: 'var(--text-secondary)' }} />
      </div>

      {/* Muscle group filter pills */}
      <div
        className="flex gap-2 overflow-x-auto pb-0.5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
      >
        {MUSCLE_GROUPS.map((group) => (
          <Pill
            key={group}
            active={filterMuscleGroup === group}
            onClick={() => setFilterMuscleGroup(group)}
          >
            {group}
          </Pill>
        ))}
      </div>

      {/* Exercise Selector */}
      <Card onClick={() => setPickerOpen(true)}>
        <div className="flex items-center gap-3">
          <Search size={16} style={{ color: 'var(--text-secondary)' }} />
          <span className="flex-1 font-medium text-body">
            {selectedExercise?.name ?? 'Select exercise'}
          </span>
          <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        <StatTile
          label="CURRENT"
          value={stats.current ? `${stats.current.weight}kg` : '—'}
        />
        <StatTile label="+30 DAYS" value={deltaDisplay} valueColor={deltaColor} />
        <StatTile
          label="BEST"
          value={stats.best ? `${stats.best.weight}kg` : '—'}
          valueColor={stats.best ? 'accent' : 'default'}
        />
      </div>

      {/* Chart Card */}
      <Card>
        {loading ? (
          <div className="h-[200px] flex items-center justify-center">
            <span className="text-body" style={{ color: 'var(--text-tertiary)' }}>
              Loading…
            </span>
          </div>
        ) : progressData.length === 0 ? (
          <div className="h-[200px] flex flex-col items-center justify-center gap-2">
            <TrendingUp size={28} style={{ color: 'var(--text-tertiary)' }} />
            <span
              className="text-body text-center"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Start logging to see your progress
            </span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={progressData}
              margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
            >
              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="weekLabel"
                tick={{ fill: 'var(--text-secondary)', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: 'var(--text-secondary)', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                width={40}
                domain={['auto', 'auto']}
              />
              {/* Faded secondary line for raw top-set weight */}
              <Line
                type="monotone"
                dataKey="topSetWeight"
                stroke="var(--text-secondary)"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                activeDot={false}
                opacity={0.4}
              />
              {/* Primary line: estimated 1RM */}
              <Line
                type="monotone"
                dataKey="estimated1RM"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={renderDot as never}
                activeDot={{ r: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="flex flex-col gap-2">
          <p
            className="text-label-xs uppercase tracking-wide"
            style={{ color: 'var(--text-secondary)' }}
          >
            Recent sessions
          </p>
          {recentSessions.map((session) => (
            <Card key={session.date} className="py-3 px-4">
              <div className="flex items-center justify-between">
                <span className="text-body" style={{ color: 'var(--text-secondary)' }}>
                  {format(parseISO(session.date), 'MMM d')}
                </span>
                <span
                  className="text-body font-medium tabular-nums"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {session.topSetWeight}kg × {session.topSetReps}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Exercise Picker Sheet */}
      <ExercisePickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        exerciseGroups={exerciseGroups}
        selectedExerciseId={selectedExercise?.id ?? null}
        initialFilter={filterMuscleGroup}
        onSelect={handleSelectExercise}
      />
    </main>
  )
}
