'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { Pill } from '@/components/ui/Pill'
import type { ExerciseBasic, ExerciseGroup } from '@/lib/data/queries'

const FILTER_LABELS = ['All', 'Back', 'Chest', 'Legs', 'Arms', 'Shoulders', 'Core'] as const
type FilterLabel = (typeof FILTER_LABELS)[number]

const FILTER_TO_MUSCLE_GROUPS: Record<FilterLabel, string[]> = {
  All: [],
  Back: ['Back'],
  Chest: ['Chest'],
  Legs: ['Legs'],
  Arms: ['Biceps', 'Triceps'],
  Shoulders: ['Shoulders'],
  Core: ['Core'],
}

interface ExercisePickerSheetProps {
  open: boolean
  onClose: () => void
  exerciseGroups: ExerciseGroup[]
  selectedExerciseId: string | null
  initialFilter: FilterLabel
  onSelect: (exercise: ExerciseBasic) => void
}

export function ExercisePickerSheet({
  open,
  onClose,
  exerciseGroups,
  selectedExerciseId,
  initialFilter,
  onSelect,
}: ExercisePickerSheetProps) {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterLabel>(initialFilter)

  const filtered = exerciseGroups
    .filter((g) => {
      if (activeFilter === 'All') return true
      const allowed = FILTER_TO_MUSCLE_GROUPS[activeFilter]
      return allowed.includes(g.muscleGroup)
    })
    .map((g) => ({
      ...g,
      exercises: g.exercises.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((g) => g.exercises.length > 0)

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 max-w-md mx-auto z-50 bg-[var(--surface)] rounded-t-2xl flex flex-col"
            style={{ height: '80vh' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
              <p className="text-h3 font-medium">Select exercise</p>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--surface-hover)]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2 bg-[var(--bg)] rounded-lg px-3 py-2.5 [border:0.5px_solid_var(--border)]">
                <input
                  type="text"
                  placeholder="Search exercises…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-body outline-none placeholder:text-[var(--text-tertiary)]"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Filter chips */}
            <div
              className="px-5 pb-3 flex gap-2 overflow-x-auto flex-shrink-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
            >
              {FILTER_LABELS.map((label) => (
                <Pill
                  key={label}
                  active={activeFilter === label}
                  onClick={() => setActiveFilter(label)}
                >
                  {label}
                </Pill>
              ))}
            </div>

            {/* Exercise list */}
            <div className="flex-1 overflow-y-auto px-5 pb-8">
              {filtered.length === 0 ? (
                <p
                  className="text-body text-center pt-8"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  No exercises found
                </p>
              ) : (
                filtered.map((group) => (
                  <div key={group.muscleGroup} className="mb-5">
                    <p
                      className="text-label-xs uppercase tracking-wide mb-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {group.muscleGroup}
                    </p>
                    <div className="flex flex-col">
                      {group.exercises.map((exercise) => {
                        const isSelected = exercise.id === selectedExerciseId
                        return (
                          <button
                            key={exercise.id}
                            onClick={() => onSelect(exercise)}
                            className="flex items-center justify-between w-full px-3 py-3 rounded-lg text-left transition-colors min-h-[44px]"
                            style={{
                              background: isSelected ? 'var(--accent-bg)' : 'transparent',
                            }}
                          >
                            <span
                              className="text-body"
                              style={{
                                color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                              }}
                            >
                              {exercise.name}
                            </span>
                            {isSelected && (
                              <Check size={14} style={{ color: 'var(--accent)' }} />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
