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
