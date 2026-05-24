'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, Minus } from 'lucide-react'
import { useWorkoutStore } from '@/lib/store/workoutStore'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'

const PRESETS = [60, 90, 120]

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function playBeep() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 440
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.25)
  } catch {
    // Web Audio not available — silent fail
  }
}

export function RestTimer() {
  const store = useWorkoutStore()
  const { restTimer, exercises, currentExerciseIndex, tickRest, skipRest, addRestTime, setRestPreset } = store
  const { active, secondsLeft, totalSeconds, completedSetInfo } = restTimer
  const dismissedRef = useRef(false)

  // Tick interval
  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => tickRest(), 1000)
    return () => clearInterval(interval)
  }, [active, tickRest])

  // On reaching zero: vibrate, beep, dismiss after 1s
  useEffect(() => {
    if (!active || secondsLeft > 0) {
      dismissedRef.current = false
      return
    }
    if (dismissedRef.current) return
    dismissedRef.current = true

    if (typeof navigator !== 'undefined') {
      navigator.vibrate?.([200, 100, 200])
    }
    playBeep()

    const t = setTimeout(() => skipRest(), 1000)
    return () => clearTimeout(t)
  }, [active, secondsLeft, skipRest])

  // ── Compute "NEXT UP" info ─────────────────────────────────────────────────
  let nextLabel = ''
  let suggestedWeight: number | null = null
  let weightUp = false

  if (completedSetInfo) {
    const { exerciseName, setNumber, weight, reps, targetReps, isLastSetOfExercise } = completedSetInfo

    if (isLastSetOfExercise) {
      const nextEx = exercises[currentExerciseIndex + 1]
      if (nextEx) {
        nextLabel = `${nextEx.name} · Set 1 · ${nextEx.targetRepsPerSet[0]} reps`
      } else {
        nextLabel = 'Last exercise — great work'
      }
    } else {
      const currentEx = exercises.find(e => e.id === completedSetInfo.exerciseId)
      const nextSetTargetReps = currentEx?.targetRepsPerSet[setNumber] ?? targetReps
      nextLabel = `${exerciseName} · Set ${setNumber + 1} · ${nextSetTargetReps} reps`

      // Weight suggestion: if hit or exceeded target reps, go up 2.5kg
      if (reps !== null && reps >= targetReps) {
        suggestedWeight = (weight ?? 0) + 2.5
        weightUp = true
      } else {
        suggestedWeight = weight ?? 0
        weightUp = false
      }
    }
  }

  const progress = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="rest-timer-backdrop"
          className="fixed inset-x-0 bottom-0 flex justify-center z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="w-full max-w-md flex flex-col"
            style={{
              height: '60vh',
              background: 'var(--bg)',
              borderTop: '0.5px solid var(--border)',
              borderLeft: '0.5px solid var(--border)',
              borderRight: '0.5px solid var(--border)',
              borderRadius: '16px 16px 0 0',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="flex flex-col h-full px-5 pt-5 pb-safe overflow-hidden">
              {/* Completed set info */}
              {completedSetInfo && (
                <div className="text-center mb-4">
                  <p className="text-label-xs uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                    SET {completedSetInfo.setNumber} COMPLETED
                    {completedSetInfo.weight !== null && completedSetInfo.reps !== null
                      ? ` · ${completedSetInfo.weight}kg × ${completedSetInfo.reps}`
                      : ''}
                  </p>
                  <p className="text-label-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {completedSetInfo.exerciseName}
                  </p>
                </div>
              )}

              {/* Countdown */}
              <div className="flex flex-col items-center mb-4">
                <span
                  className="text-[64px] font-medium tabular-nums leading-none"
                  style={{ color: secondsLeft <= 5 ? 'var(--danger)' : 'var(--accent)' }}
                >
                  {formatTime(Math.max(0, secondsLeft))}
                </span>
                <span className="text-label-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  of {formatTime(totalSeconds)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <ProgressBar value={progress} />
              </div>

              {/* Presets */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {PRESETS.map(preset => (
                  <button
                    key={preset}
                    onClick={() => setRestPreset(preset)}
                    className="py-2.5 rounded-xl text-label-sm uppercase tracking-wide active:scale-[0.97] transition-transform"
                    style={{
                      background: 'var(--surface)',
                      border: totalSeconds === preset
                        ? '0.5px solid var(--accent)'
                        : '0.5px solid var(--border)',
                      color: totalSeconds === preset ? 'var(--accent)' : 'var(--text-secondary)',
                    }}
                  >
                    {preset}s
                  </button>
                ))}
              </div>

              {/* +15s and Skip */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => addRestTime(15)}
                  className="py-3 rounded-xl text-body active:scale-[0.97] transition-transform"
                  style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', color: 'var(--text-primary)' }}
                >
                  +15s
                </button>
                <Button variant="secondary" onClick={skipRest}>
                  Skip rest
                </Button>
              </div>

              {/* Next up */}
              {nextLabel ? (
                <div
                  className="rounded-xl p-3 mt-auto"
                  style={{ background: 'var(--surface)', border: '0.5px solid var(--border)' }}
                >
                  <p className="text-label-xs uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    NEXT UP
                  </p>
                  <p className="text-body">{nextLabel}</p>
                  {suggestedWeight !== null && (
                    <div className="flex items-center gap-1.5 mt-1">
                      {weightUp ? (
                        <ArrowUp size={12} style={{ color: 'var(--success)' }} />
                      ) : (
                        <Minus size={12} style={{ color: 'var(--text-tertiary)' }} />
                      )}
                      <span
                        className="text-label-sm tabular-nums"
                        style={{ color: weightUp ? 'var(--success)' : 'var(--text-tertiary)' }}
                      >
                        {suggestedWeight}kg suggested
                      </span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
