import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'

export interface WorkoutExercise {
  id: string
  name: string
  muscleGroup: string
  videoUrl: string | null
  formCues: string | null
  orderIndex: number
  targetSets: number
  targetRepsPerSet: number[]
  restSeconds: number
  defaultWeightKg: number | null
}

export interface SetLogEntry {
  setNumber: number
  weight: number | null
  reps: number | null
  completed: boolean
  completedAt?: number
}

export interface CompletedSetInfo {
  exerciseId: string
  exerciseName: string
  setNumber: number
  weight: number | null
  reps: number | null
  targetReps: number
  isLastSetOfExercise: boolean
}

interface RestTimer {
  active: boolean
  secondsLeft: number
  totalSeconds: number
  completedSetInfo?: CompletedSetInfo
}

interface OfflineQueueItem {
  type: 'set_log' | 'session_complete'
  payload: Record<string, unknown>
  attemptedAt?: number
}

interface WorkoutStore {
  currentSession: {
    id: string | null
    workoutDayId: string | null
    startedAt: number | null
  }
  exercises: WorkoutExercise[]
  currentExerciseIndex: number
  setLogs: Record<string, SetLogEntry[]>
  restTimer: RestTimer
  offlineQueue: OfflineQueueItem[]
  isCompleted: boolean

  startSession: (workoutDayId: string, exercises: WorkoutExercise[]) => Promise<void>
  updateSet: (exerciseId: string, setIndex: number, partial: { weight?: number; reps?: number }) => void
  completeSet: (exerciseId: string, setIndex: number) => Promise<void>
  uncompleteSet: (exerciseId: string, setIndex: number) => Promise<void>
  advanceToNextExercise: () => void
  goToExercise: (index: number) => void
  startRest: (seconds: number, info?: CompletedSetInfo) => void
  tickRest: () => void
  skipRest: () => void
  addRestTime: (seconds: number) => void
  setRestPreset: (seconds: number) => void
  finishWorkout: () => Promise<void>
  syncOfflineQueue: () => Promise<void>
  resetSession: () => void
}

const INITIAL_REST_TIMER: RestTimer = { active: false, secondsLeft: 0, totalSeconds: 0 }

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      currentSession: { id: null, workoutDayId: null, startedAt: null },
      exercises: [],
      currentExerciseIndex: 0,
      setLogs: {},
      restTimer: INITIAL_REST_TIMER,
      offlineQueue: [],
      isCompleted: false,

      startSession: async (workoutDayId, exercises) => {
        const supabase = createClient()
        let sessionId: string | null = null

        try {
          if (typeof navigator !== 'undefined' && !navigator.onLine) throw new Error('offline')
          const { data, error } = await supabase
            .from('workout_sessions')
            .insert({ workout_day_id: workoutDayId, started_at: new Date().toISOString() })
            .select('id')
            .single()
          if (error) throw error
          sessionId = data?.id ?? null
        } catch {
          sessionId = typeof crypto !== 'undefined' ? crypto.randomUUID() : `local-${Date.now()}`
        }

        const setLogs: Record<string, SetLogEntry[]> = {}
        for (const ex of exercises) {
          setLogs[ex.id] = ex.targetRepsPerSet.map((targetReps, i) => ({
            setNumber: i + 1,
            weight: null,
            reps: targetReps,
            completed: false,
          }))
        }

        set({
          currentSession: { id: sessionId, workoutDayId, startedAt: Date.now() },
          exercises,
          currentExerciseIndex: 0,
          setLogs,
          restTimer: INITIAL_REST_TIMER,
          offlineQueue: [],
          isCompleted: false,
        })
      },

      updateSet: (exerciseId, setIndex, partial) => {
        const { setLogs } = get()
        const logs = [...(setLogs[exerciseId] ?? [])]
        if (!logs[setIndex]) return
        logs[setIndex] = { ...logs[setIndex], ...partial }
        set({ setLogs: { ...setLogs, [exerciseId]: logs } })
      },

      completeSet: async (exerciseId, setIndex) => {
        const state = get()
        const { currentSession, exercises, setLogs } = state
        const exercise = exercises.find(e => e.id === exerciseId)
        if (!exercise) return

        const logs = [...(setLogs[exerciseId] ?? [])]
        const entry = logs[setIndex]
        if (!entry || entry.completed) return

        const now = Date.now()
        logs[setIndex] = { ...entry, completed: true, completedAt: now }
        const allDone = logs.every(l => l.completed)
        set({ setLogs: { ...setLogs, [exerciseId]: logs } })

        const payload: Record<string, unknown> = {
          session_id: currentSession.id,
          exercise_id: exerciseId,
          set_number: entry.setNumber,
          weight_kg: entry.weight,
          reps: entry.reps,
          completed_at: new Date(now).toISOString(),
        }

        try {
          if (typeof navigator !== 'undefined' && !navigator.onLine) throw new Error('offline')
          const supabase = createClient()
          const { error } = await supabase.from('set_logs').insert(payload)
          if (error) throw error
        } catch {
          set(s => ({
            offlineQueue: [...s.offlineQueue, { type: 'set_log', payload, attemptedAt: now }],
          }))
        }

        const completedSetInfo: CompletedSetInfo = {
          exerciseId,
          exerciseName: exercise.name,
          setNumber: entry.setNumber,
          weight: entry.weight,
          reps: entry.reps,
          targetReps: exercise.targetRepsPerSet[setIndex],
          isLastSetOfExercise: allDone,
        }
        get().startRest(exercise.restSeconds, completedSetInfo)
      },

      uncompleteSet: async (exerciseId, setIndex) => {
        const { setLogs, currentSession, offlineQueue } = get()
        const logs = [...(setLogs[exerciseId] ?? [])]
        const entry = logs[setIndex]
        if (!entry || !entry.completed) return

        logs[setIndex] = { ...entry, completed: false, completedAt: undefined }
        const filteredQueue = offlineQueue.filter(
          item =>
            !(
              item.type === 'set_log' &&
              item.payload.exercise_id === exerciseId &&
              item.payload.set_number === entry.setNumber
            )
        )
        set({ setLogs: { ...setLogs, [exerciseId]: logs }, offlineQueue: filteredQueue })

        if (currentSession.id) {
          try {
            const supabase = createClient()
            await supabase
              .from('set_logs')
              .delete()
              .eq('session_id', currentSession.id)
              .eq('exercise_id', exerciseId)
              .eq('set_number', entry.setNumber)
          } catch {
            // best effort
          }
        }
      },

      advanceToNextExercise: () => {
        const { currentExerciseIndex, exercises } = get()
        const nextIndex = currentExerciseIndex + 1
        if (nextIndex >= exercises.length) {
          get().finishWorkout()
        } else {
          set({ currentExerciseIndex: nextIndex })
        }
      },

      goToExercise: (index) => {
        const { exercises } = get()
        if (index >= 0 && index < exercises.length) {
          set({ currentExerciseIndex: index })
        }
      },

      startRest: (seconds, info) => {
        set({
          restTimer: {
            active: true,
            secondsLeft: seconds,
            totalSeconds: seconds,
            completedSetInfo: info,
          },
        })
      },

      tickRest: () => {
        const { restTimer } = get()
        if (!restTimer.active || restTimer.secondsLeft <= 0) return
        set({ restTimer: { ...restTimer, secondsLeft: restTimer.secondsLeft - 1 } })
      },

      skipRest: () => {
        const { restTimer } = get()
        const shouldAdvance = restTimer.completedSetInfo?.isLastSetOfExercise ?? false
        set({ restTimer: INITIAL_REST_TIMER })
        if (shouldAdvance) {
          get().advanceToNextExercise()
        }
      },

      addRestTime: (seconds) => {
        const { restTimer } = get()
        if (!restTimer.active) return
        set({
          restTimer: {
            ...restTimer,
            secondsLeft: restTimer.secondsLeft + seconds,
            totalSeconds: restTimer.totalSeconds + seconds,
          },
        })
      },

      setRestPreset: (seconds) => {
        const { restTimer } = get()
        if (!restTimer.active) return
        const ratio = restTimer.totalSeconds > 0 ? restTimer.secondsLeft / restTimer.totalSeconds : 1
        set({
          restTimer: {
            ...restTimer,
            secondsLeft: Math.round(seconds * ratio),
            totalSeconds: seconds,
          },
        })
      },

      finishWorkout: async () => {
        const { currentSession } = get()
        if (!currentSession.id || !currentSession.startedAt) return

        const durationSeconds = Math.round((Date.now() - currentSession.startedAt) / 1000)
        const payload: Record<string, unknown> = {
          session_id: currentSession.id,
          completed_at: new Date().toISOString(),
          duration_seconds: durationSeconds,
        }

        try {
          if (typeof navigator !== 'undefined' && !navigator.onLine) throw new Error('offline')
          const supabase = createClient()
          const { error } = await supabase
            .from('workout_sessions')
            .update({ completed_at: payload.completed_at, duration_seconds: durationSeconds })
            .eq('id', currentSession.id)
          if (error) throw error
        } catch {
          set(s => ({
            offlineQueue: [
              ...s.offlineQueue,
              { type: 'session_complete', payload, attemptedAt: Date.now() },
            ],
          }))
        }

        set({ isCompleted: true })
      },

      syncOfflineQueue: async () => {
        const { offlineQueue } = get()
        if (offlineQueue.length === 0) return

        const supabase = createClient()
        const remaining: OfflineQueueItem[] = []

        for (const item of offlineQueue) {
          try {
            if (item.type === 'set_log') {
              const { error } = await supabase.from('set_logs').insert(item.payload)
              if (error) throw error
            } else if (item.type === 'session_complete') {
              const { error } = await supabase
                .from('workout_sessions')
                .update({
                  completed_at: item.payload.completed_at,
                  duration_seconds: item.payload.duration_seconds,
                })
                .eq('id', item.payload.session_id)
              if (error) throw error
            }
          } catch {
            remaining.push(item)
          }
        }

        set({ offlineQueue: remaining })
      },

      resetSession: () => {
        set({
          currentSession: { id: null, workoutDayId: null, startedAt: null },
          exercises: [],
          currentExerciseIndex: 0,
          setLogs: {},
          restTimer: INITIAL_REST_TIMER,
          offlineQueue: [],
          isCompleted: false,
        })
      },
    }),
    {
      name: 'buildup-workout-v2',
      partialize: (state) => ({
        currentSession: state.currentSession,
        exercises: state.exercises,
        currentExerciseIndex: state.currentExerciseIndex,
        setLogs: state.setLogs,
        offlineQueue: state.offlineQueue,
        // restTimer and isCompleted are intentionally NOT persisted
      }),
    }
  )
)
