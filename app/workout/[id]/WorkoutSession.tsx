'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, MoreVertical, Play, ChevronLeft, ChevronRight, CheckCircle2, Pencil } from 'lucide-react'
import { useWorkoutStore, WorkoutExercise } from '@/lib/store/workoutStore'
import { TodaysWorkoutResult, PreviousSessionLogs } from '@/lib/data/queries'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { NumberInput } from '@/components/ui/NumberInput'
import { RestTimer } from '@/components/RestTimer'

interface Props {
  workoutData: TodaysWorkoutResult
  prevLogs: PreviousSessionLogs
  workoutDayId: string
}

export function WorkoutSession({ workoutData, prevLogs, workoutDayId }: Props) {
  const router = useRouter()
  const store = useWorkoutStore()
  const initRef = useRef(false)

  const [showExitDialog, setShowExitDialog] = useState(false)
  const [showOptionsSheet, setShowOptionsSheet] = useState(false)
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  const {
    currentSession,
    exercises,
    currentExerciseIndex,
    setLogs,
    isCompleted,
    startSession,
    updateSet,
    completeSet,
    uncompleteSet,
    goToExercise,
    syncOfflineQueue,
  } = store

  // Initialize or resume session
  useEffect(() => {
    const needsInit =
      !currentSession.workoutDayId ||
      currentSession.workoutDayId !== workoutDayId ||
      exercises.length === 0

    if (!needsInit || initRef.current) return
    initRef.current = true

    const mappedExercises: WorkoutExercise[] = workoutData.exercises.map(wde => ({
      id: wde.exercise.id,
      name: wde.exercise.name,
      muscleGroup: wde.exercise.muscle_group,
      videoUrl: wde.exercise.video_url,
      formCues: wde.exercise.form_cues,
      orderIndex: wde.order_index,
      targetSets: wde.target_sets,
      targetRepsPerSet: wde.target_reps_per_set,
      restSeconds: wde.rest_seconds,
    }))

    startSession(workoutDayId, mappedExercises).then(() => {
      // Apply previous session weights as defaults
      for (const ex of mappedExercises) {
        const prevExLogs = prevLogs[ex.id]
        if (!prevExLogs) continue
        ex.targetRepsPerSet.forEach((_, i) => {
          const prevWeight =
            prevExLogs[i]?.weight_kg ??
            (i > 0 ? prevExLogs[i - 1]?.weight_kg : undefined) ??
            null
          if (prevWeight !== null) {
            useWorkoutStore.getState().updateSet(ex.id, i, { weight: prevWeight })
          }
        })
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset editing when switching exercises
  useEffect(() => {
    setEditingSetIndex(null)
  }, [currentExerciseIndex])

  // Online / offline detection + queue sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      syncOfflineQueue()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [syncOfflineQueue])

  // Navigate when workout completes
  useEffect(() => {
    if (isCompleted) {
      router.push(`/workout/${workoutDayId}/complete`)
    }
  }, [isCompleted, router, workoutDayId])

  if (exercises.length === 0) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <p style={{ color: 'var(--text-secondary)' }}>Starting workout…</p>
      </main>
    )
  }

  const currentExercise = exercises[currentExerciseIndex]
  if (!currentExercise) return null

  const currentSetLogs = setLogs[currentExercise.id] ?? []
  const firstIncompleteIndex = currentSetLogs.findIndex(s => !s.completed)
  const activeSetIndex = editingSetIndex !== null ? editingSetIndex : firstIncompleteIndex

  // Progress: total sets across all exercises
  const totalSets = exercises.reduce((sum, e) => sum + e.targetSets, 0)
  const completedSets = Object.values(setLogs).reduce(
    (sum, logs) => sum + logs.filter(l => l.completed).length,
    0
  )

  // Previous session display (first set of exercise)
  const prevExLogs = prevLogs[currentExercise.id]
  const prevLabel =
    prevExLogs?.[0]?.weight_kg != null
      ? `Last session: ${prevExLogs[0].weight_kg}kg × ${prevExLogs[0].reps ?? '?'}`
      : 'First time — start light'

  const handleCompleteSet = async (setIndex: number) => {
    setEditingSetIndex(null)
    await completeSet(currentExercise.id, setIndex)
  }

  const handleEditSet = async (setIndex: number) => {
    await uncompleteSet(currentExercise.id, setIndex)
    setEditingSetIndex(setIndex)
  }

  return (
    <main className="px-5 pt-4 pb-8 flex flex-col gap-4">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="flex justify-center">
          <span
            className="text-label-xs uppercase tracking-wide px-3 py-1.5 rounded-full"
            style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '0.5px solid var(--border)' }}
          >
            Offline — will sync
          </span>
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowExitDialog(true)}
          className="w-9 h-9 flex items-center justify-center rounded-full active:scale-[0.95] transition-transform"
          style={{ background: 'var(--surface)', border: '0.5px solid var(--border)' }}
          aria-label="End workout"
        >
          <X size={16} style={{ color: 'var(--text-primary)' }} />
        </button>

        <span className="text-label-xs uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          EXERCISE {currentExerciseIndex + 1} OF {exercises.length}
        </span>

        <button
          onClick={() => setShowOptionsSheet(true)}
          className="w-9 h-9 flex items-center justify-center rounded-full active:scale-[0.95] transition-transform"
          style={{ background: 'var(--surface)', border: '0.5px solid var(--border)' }}
          aria-label="More options"
        >
          <MoreVertical size={16} style={{ color: 'var(--text-primary)' }} />
        </button>
      </div>

      {/* Progress bar */}
      <ProgressBar value={totalSets > 0 ? (completedSets / totalSets) * 100 : 0} />

      {/* Exercise header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-h1 font-medium">{currentExercise.name}</h1>
          <p className="text-label-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {currentExercise.muscleGroup} · {currentExercise.targetSets} sets
          </p>
        </div>
        <a
          href="#"
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 active:scale-[0.95] transition-transform"
          style={{ background: 'var(--surface)', border: '0.5px solid var(--border)' }}
          aria-label="Watch video"
        >
          <Play size={14} fill="var(--accent)" style={{ color: 'var(--accent)' }} />
        </a>
      </div>

      {/* Previous session */}
      <p className="text-label-sm" style={{ color: 'var(--text-secondary)' }}>
        {prevLabel}
      </p>

      {/* Set cards */}
      <div className="flex flex-col gap-3">
        {currentSetLogs.map((setLog, setIndex) => {
          const targetReps = currentExercise.targetRepsPerSet[setIndex]
          const isActive = setIndex === activeSetIndex
          const isDone = setLog.completed && setIndex !== editingSetIndex

          if (isDone) {
            return (
              <CompletedSetCard
                key={setIndex}
                setNumber={setLog.setNumber}
                targetReps={targetReps}
                weight={setLog.weight}
                reps={setLog.reps}
                onEdit={() => handleEditSet(setIndex)}
              />
            )
          }

          if (isActive) {
            return (
              <ActiveSetCard
                key={setIndex}
                setNumber={setLog.setNumber}
                targetReps={targetReps}
                weight={setLog.weight ?? 0}
                reps={setLog.reps ?? targetReps}
                onWeightChange={w => updateSet(currentExercise.id, setIndex, { weight: w })}
                onRepsChange={r => updateSet(currentExercise.id, setIndex, { reps: r })}
                onComplete={() => handleCompleteSet(setIndex)}
              />
            )
          }

          return (
            <FutureSetCard
              key={setIndex}
              setNumber={setLog.setNumber}
              targetReps={targetReps}
            />
          )
        })}
      </div>

      {/* Exercise navigation */}
      <div className="flex items-center justify-between pt-2">
        {currentExerciseIndex > 0 ? (
          <button
            onClick={() => goToExercise(currentExerciseIndex - 1)}
            className="flex items-center gap-1 min-h-[44px] px-1 active:opacity-60 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ChevronLeft size={16} />
            <span className="text-body">Previous</span>
          </button>
        ) : (
          <div />
        )}
        {currentExerciseIndex < exercises.length - 1 ? (
          <button
            onClick={() => goToExercise(currentExerciseIndex + 1)}
            className="flex items-center gap-1 min-h-[44px] px-1 active:opacity-60 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span className="text-body">Next</span>
            <ChevronRight size={16} />
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Rest timer overlay — always mounted, shows/hides via store state */}
      <RestTimer />

      {/* Exit dialog */}
      {showExitDialog && (
        <ExitDialog
          onConfirm={() => router.push('/')}
          onCancel={() => setShowExitDialog(false)}
        />
      )}

      {/* Options bottom sheet */}
      {showOptionsSheet && (
        <OptionsSheet
          exerciseName={currentExercise.name}
          onSkip={() => {
            goToExercise(currentExerciseIndex + 1)
            setShowOptionsSheet(false)
          }}
          canSkip={currentExerciseIndex < exercises.length - 1}
          onClose={() => setShowOptionsSheet(false)}
        />
      )}
    </main>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function CompletedSetCard({
  setNumber,
  targetReps,
  weight,
  reps,
  onEdit,
}: {
  setNumber: number
  targetReps: number
  weight: number | null
  reps: number | null
  onEdit: () => void
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', opacity: 0.55 }}
    >
      <div className="flex items-center gap-3">
        <CheckCircle2 size={24} style={{ color: 'var(--success)', flexShrink: 0 }} />
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div>
            <p className="text-label-xs uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              SET {setNumber} · TARGET {targetReps}
            </p>
            <p className="text-[22px] font-medium tabular-nums mt-0.5">
              {weight !== null ? `${weight} kg` : '— kg'}
            </p>
          </div>
          <div>
            <p className="text-label-xs uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              REPS
            </p>
            <p className="text-[22px] font-medium tabular-nums mt-0.5">
              {reps !== null ? reps : '—'}
            </p>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ background: 'var(--bg)' }}
          aria-label="Edit set"
        >
          <Pencil size={13} style={{ color: 'var(--text-tertiary)' }} />
        </button>
      </div>
    </div>
  )
}

function ActiveSetCard({
  setNumber,
  targetReps,
  weight,
  reps,
  onWeightChange,
  onRepsChange,
  onComplete,
}: {
  setNumber: number
  targetReps: number
  weight: number
  reps: number
  onWeightChange: (w: number) => void
  onRepsChange: (r: number) => void
  onComplete: () => void
}) {
  return (
    <Card active>
      <div className="flex items-center justify-between mb-4">
        <span className="text-label-xs uppercase tracking-wide" style={{ color: 'var(--accent)' }}>
          SET {setNumber} · TARGET {targetReps}
        </span>
        <span className="text-label-xs" style={{ color: 'var(--text-tertiary)' }}>
          Active
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div
          className="rounded-xl p-3"
          style={{ background: 'var(--bg)', border: '0.5px solid var(--border)' }}
        >
          <NumberInput
            label="WEIGHT (KG)"
            value={weight}
            onChange={onWeightChange}
            step={2.5}
            min={0}
            max={500}
          />
        </div>
        <div
          className="rounded-xl p-3"
          style={{ background: 'var(--bg)', border: '0.5px solid var(--border)' }}
        >
          <NumberInput
            label="REPS"
            value={reps}
            onChange={onRepsChange}
            step={1}
            min={1}
            max={99}
          />
        </div>
      </div>

      <Button fullWidth size="lg" onClick={onComplete}>
        Complete set
      </Button>
    </Card>
  )
}

function FutureSetCard({ setNumber, targetReps }: { setNumber: number; targetReps: number }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--surface)', border: '0.5px solid var(--border)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--bg)', border: '0.5px solid var(--border)' }}
        >
          <span className="text-label-xs tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
            {setNumber}
          </span>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div>
            <p className="text-label-xs uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
              SET {setNumber} · TARGET {targetReps}
            </p>
            <p className="text-[22px] font-medium tabular-nums mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              — kg
            </p>
          </div>
          <div>
            <p className="text-label-xs uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
              REPS
            </p>
            <p className="text-[22px] font-medium tabular-nums mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              —
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ExitDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-xs rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: 'var(--surface)', border: '0.5px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div>
          <p className="text-body font-medium">End workout?</p>
          <p className="text-body mt-1" style={{ color: 'var(--text-secondary)' }}>
            Progress will be saved.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="secondary" fullWidth onClick={onConfirm}>
            End workout
          </Button>
          <Button variant="ghost" fullWidth onClick={onCancel}>
            Keep going
          </Button>
        </div>
      </div>
    </div>
  )
}

function OptionsSheet({
  exerciseName,
  canSkip,
  onSkip,
  onClose,
}: {
  exerciseName: string
  canSkip: boolean
  onSkip: () => void
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl pb-safe flex flex-col"
        style={{ background: 'var(--surface)', border: '0.5px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4" style={{ borderBottom: '0.5px solid var(--border)' }}>
          <p className="text-label-xs uppercase tracking-wide text-center" style={{ color: 'var(--text-secondary)' }}>
            {exerciseName}
          </p>
        </div>

        <div className="flex flex-col py-2">
          {canSkip && (
            <button
              onClick={onSkip}
              className="px-5 py-4 text-left text-body active:bg-[var(--surface-hover)] transition-colors"
            >
              Skip exercise
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-4 text-left text-body active:bg-[var(--surface-hover)] transition-colors"
          >
            Watch video
          </button>
          <button
            className="px-5 py-4 text-left text-body"
            style={{ color: 'var(--text-tertiary)' }}
            onClick={onClose}
          >
            Replace exercise — coming soon
          </button>
        </div>

        <button
          onClick={onClose}
          className="mx-5 mb-6 mt-2 py-4 rounded-xl text-body active:scale-[0.98] transition-transform"
          style={{ background: 'var(--bg)', border: '0.5px solid var(--border)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
