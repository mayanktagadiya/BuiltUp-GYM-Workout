import { createClient } from '@/lib/supabase/server'

export function getCurrentDayOfWeek(): number {
  const jsDay = new Date().getDay() // 0=Sun, 1=Mon ... 6=Sat
  return jsDay === 0 ? 7 : jsDay   // Mon=1, Sun=7
}

export function estimateWorkoutMinutes(totalSets: number): number {
  return Math.round(totalSets * 1.5)
}

export async function getCurrentWeekNumber(): Promise<number> {
  const supabase = createClient()

  const { data } = await supabase
    .from('user_preferences')
    .select('id, starting_date')
    .limit(1)
    .maybeSingle()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  if (!data) {
    await supabase.from('user_preferences').insert({ starting_date: todayStr })
    return 1
  }

  if (!data.starting_date) {
    await supabase
      .from('user_preferences')
      .update({ starting_date: todayStr })
      .eq('id', data.id)
    return 1
  }

  const startDate = new Date(data.starting_date)
  startDate.setHours(0, 0, 0, 0)
  const diffDays = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  return Math.floor(diffDays / 7) + 1
}

export type TodaysWorkoutExercise = {
  id: string
  workout_day_id: string
  exercise_id: string
  order_index: number
  target_sets: number
  target_reps_per_set: number[]
  rest_seconds: number
  notes: string | null
  exercise: {
    id: string
    name: string
    muscle_group: string
    secondary_muscles: string | null
    video_url: string | null
    form_cues: string | null
    created_at: string
  }
}

export type TodaysWorkoutResult = {
  workoutDay: {
    id: string
    day_of_week: number
    name: string
    subtitle: string | null
    is_rest_day: boolean
    created_at: string
  }
  exercises: TodaysWorkoutExercise[]
  totalSets: number
}

type RawDayWithExercises = {
  id: string
  day_of_week: number
  name: string
  subtitle: string | null
  is_rest_day: boolean
  created_at: string
  workout_day_exercises: { target_sets: number }[]
}

export type WeekWorkoutDaySummary = {
  id: string
  day_of_week: number
  name: string
  subtitle: string | null
  is_rest_day: boolean
  created_at: string
  exercise_count: number
  total_sets: number
}

export async function getTodaysWorkout(): Promise<TodaysWorkoutResult | null> {
  const supabase = createClient()
  const dayOfWeek = getCurrentDayOfWeek()

  const { data: workoutDay, error } = await supabase
    .from('workout_days')
    .select('*')
    .eq('day_of_week', dayOfWeek)
    .single()

  if (error || !workoutDay) return null

  if (workoutDay.is_rest_day) {
    return { workoutDay, exercises: [], totalSets: 0 }
  }

  const { data: rawExercises } = await supabase
    .from('workout_day_exercises')
    .select('*, exercise:exercises(*)')
    .eq('workout_day_id', workoutDay.id)
    .order('order_index')

  const exercises = (rawExercises ?? []) as unknown as TodaysWorkoutExercise[]
  const totalSets = exercises.reduce((sum, e) => sum + e.target_sets, 0)

  return { workoutDay, exercises, totalSets }
}

export async function getWeekWorkouts(): Promise<WeekWorkoutDaySummary[]> {
  const supabase = createClient()

  const { data: rawDays } = await supabase
    .from('workout_days')
    .select('*, workout_day_exercises(target_sets)')
    .order('day_of_week')

  if (!rawDays) return []

  const days = rawDays as unknown as RawDayWithExercises[]

  return days.map((day) => {
    const wdes = day.workout_day_exercises ?? []
    return {
      id: day.id,
      day_of_week: day.day_of_week,
      name: day.name,
      subtitle: day.subtitle,
      is_rest_day: day.is_rest_day,
      created_at: day.created_at,
      exercise_count: wdes.length,
      total_sets: wdes.reduce((sum, e) => sum + e.target_sets, 0),
    }
  })
}

export type PreviousSetLog = { weight_kg: number | null; reps: number | null }
export type PreviousSessionLogs = Record<string, (PreviousSetLog | undefined)[]>

export async function getPreviousSessionLogs(workoutDayId: string): Promise<PreviousSessionLogs> {
  const supabase = createClient()

  const { data: session } = await supabase
    .from('workout_sessions')
    .select('id')
    .eq('workout_day_id', workoutDayId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!session) return {}

  const { data: logs } = await supabase
    .from('set_logs')
    .select('exercise_id, set_number, weight_kg, reps')
    .eq('session_id', session.id)
    .order('set_number')

  const result: PreviousSessionLogs = {}
  for (const log of logs ?? []) {
    if (!result[log.exercise_id]) result[log.exercise_id] = []
    result[log.exercise_id][log.set_number - 1] = {
      weight_kg: log.weight_kg !== null ? Number(log.weight_kg) : null,
      reps: log.reps,
    }
  }
  return result
}

// ─── Session History ─────────────────────────────────────────────────────────

export type SessionHistoryEntry = {
  id: string
  started_at: string
  completed_at: string
  duration_seconds: number | null
  workout_day_name: string
  total_sets_logged: number
  total_volume_kg: number
  pr_count: number
}

type RawSessionRow = {
  id: string
  started_at: string
  completed_at: string | null
  duration_seconds: number | null
  workout_days: { name: string } | null
}

export async function getSessionHistory(): Promise<SessionHistoryEntry[]> {
  const supabase = createClient()

  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('id, started_at, completed_at, duration_seconds, workout_days(name)')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })

  if (!sessions || sessions.length === 0) return []

  const rawSessions = sessions as unknown as RawSessionRow[]
  const sessionIds = rawSessions.map((s) => s.id)

  const { data: allLogs } = await supabase
    .from('set_logs')
    .select('session_id, weight_kg, reps, is_personal_record')
    .in('session_id', sessionIds)

  type RawLogRow = {
    session_id: string
    weight_kg: number | null
    reps: number | null
    is_personal_record: boolean
  }
  const rawLogs = (allLogs ?? []) as unknown as RawLogRow[]

  const logsBySession = new Map<string, RawLogRow[]>()
  for (const log of rawLogs) {
    if (!logsBySession.has(log.session_id)) logsBySession.set(log.session_id, [])
    logsBySession.get(log.session_id)!.push(log)
  }

  return rawSessions
    .filter((s) => s.completed_at !== null)
    .map((s) => {
      const logs = logsBySession.get(s.id) ?? []
      return {
        id: s.id,
        started_at: s.started_at,
        completed_at: s.completed_at!,
        duration_seconds: s.duration_seconds,
        workout_day_name: s.workout_days?.name ?? 'Workout',
        total_sets_logged: logs.length,
        total_volume_kg: logs.reduce(
          (sum, l) => sum + Number(l.weight_kg ?? 0) * (l.reps ?? 0),
          0
        ),
        pr_count: logs.filter((l) => l.is_personal_record).length,
      }
    })
}

export type SessionStats = {
  duration_seconds: number | null
  sets_done: number
  total_sets: number
  volume_kg: number
  prs: { exerciseName: string; weight: number; reps: number }[]
}

export async function getSessionStats(sessionId: string): Promise<SessionStats | null> {
  const supabase = createClient()

  const { data: session } = await supabase
    .from('workout_sessions')
    .select('duration_seconds, workout_day_id')
    .eq('id', sessionId)
    .single()

  if (!session) return null

  const [logsResult, wdesResult] = await Promise.all([
    supabase
      .from('set_logs')
      .select('weight_kg, reps, is_personal_record, exercises(name)')
      .eq('session_id', sessionId),
    supabase
      .from('workout_day_exercises')
      .select('target_sets')
      .eq('workout_day_id', session.workout_day_id),
  ])

  type RawLogWithExercise = {
    weight_kg: number | null
    reps: number | null
    is_personal_record: boolean
    exercises: { name: string } | null
  }
  const rawLogs = (logsResult.data ?? []) as unknown as RawLogWithExercise[]
  const totalSets = (wdesResult.data ?? []).reduce((sum, w) => sum + w.target_sets, 0)

  return {
    duration_seconds: session.duration_seconds,
    sets_done: rawLogs.length,
    total_sets: totalSets,
    volume_kg: rawLogs.reduce((sum, l) => sum + Number(l.weight_kg ?? 0) * (l.reps ?? 0), 0),
    prs: rawLogs
      .filter((l) => l.is_personal_record)
      .map((l) => ({
        exerciseName: l.exercises?.name ?? 'Exercise',
        weight: Number(l.weight_kg ?? 0),
        reps: l.reps ?? 0,
      })),
  }
}

export async function getStreak(): Promise<{ current: number; best: number }> {
  const supabase = createClient()

  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('completed_at')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: true })

  if (!sessions || sessions.length === 0) return { current: 0, best: 0 }

  const days = new Set(sessions.map((s) => s.completed_at!.split('T')[0]))
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

// ─── Progress ────────────────────────────────────────────────────────────────

export type ExerciseBasic = {
  id: string
  name: string
  muscle_group: string
}

export type ExerciseGroup = {
  muscleGroup: string
  exercises: ExerciseBasic[]
}

export type ExerciseProgressPoint = {
  date: string
  weekLabel: string
  topSetWeight: number
  topSetReps: number
  estimated1RM: number
}

export type ExerciseStats = {
  current: { weight: number; reps: number } | null
  best: { weight: number; reps: number } | null
  deltaLast30Days: number | null
}

export async function getMostRecentlyLoggedExercise(): Promise<ExerciseBasic | null> {
  const supabase = createClient()

  const { data } = await supabase
    .from('set_logs')
    .select('exercise_id, completed_at, exercises(id, name, muscle_group)')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return null
  return (data.exercises as unknown as ExerciseBasic) ?? null
}

export async function getAllExercisesGroupedByMuscle(): Promise<ExerciseGroup[]> {
  const supabase = createClient()

  const { data } = await supabase
    .from('exercises')
    .select('id, name, muscle_group')
    .order('muscle_group')
    .order('name')

  const groupMap = new Map<string, ExerciseBasic[]>()
  for (const ex of data ?? []) {
    if (!groupMap.has(ex.muscle_group)) groupMap.set(ex.muscle_group, [])
    groupMap.get(ex.muscle_group)!.push(ex as ExerciseBasic)
  }

  return Array.from(groupMap.entries()).map(([muscleGroup, exercises]) => ({
    muscleGroup,
    exercises,
  }))
}

export async function getExerciseProgressData(exerciseId: string): Promise<ExerciseProgressPoint[]> {
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

  const entries = Array.from(bySession.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  )

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

export async function getExerciseStats(exerciseId: string): Promise<ExerciseStats> {
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

// ─── Exercise Library ─────────────────────────────────────────────────────────

export type Exercise = {
  id: string
  name: string
  muscle_group: string
  secondary_muscles: string | null
  video_url: string | null
  form_cues: string | null
  created_at: string
}

export async function getAllExercises(): Promise<Exercise[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('exercises')
    .select('*')
    .order('muscle_group')
    .order('name')
  return (data ?? []) as Exercise[]
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return data as Exercise | null
}

export type WorkoutDayForExercise = {
  workoutDayId: string
  dayOfWeek: number
  name: string
}

export async function getWorkoutDaysContainingExercise(
  exerciseId: string
): Promise<WorkoutDayForExercise[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('workout_day_exercises')
    .select('workout_day_id, workout_days(day_of_week, name)')
    .eq('exercise_id', exerciseId)

  if (!data) return []

  type RawRow = {
    workout_day_id: string
    workout_days: { day_of_week: number; name: string } | null
  }

  return (data as unknown as RawRow[])
    .filter((row) => row.workout_days !== null)
    .map((row) => ({
      workoutDayId: row.workout_day_id,
      dayOfWeek: row.workout_days!.day_of_week,
      name: row.workout_days!.name,
    }))
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
}

// ─── Workout Day ──────────────────────────────────────────────────────────────

export async function getWorkoutDay(id: string): Promise<TodaysWorkoutResult | null> {
  const supabase = createClient()

  const { data: workoutDay, error } = await supabase
    .from('workout_days')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !workoutDay) return null

  const { data: rawExercises } = await supabase
    .from('workout_day_exercises')
    .select('*, exercise:exercises(*)')
    .eq('workout_day_id', id)
    .order('order_index')

  const exercises = (rawExercises ?? []) as unknown as TodaysWorkoutExercise[]
  const totalSets = exercises.reduce((sum, e) => sum + e.target_sets, 0)

  return { workoutDay, exercises, totalSets }
}
