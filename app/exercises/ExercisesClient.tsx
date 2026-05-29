'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Play, Search, X } from 'lucide-react'
import type { Exercise } from '@/lib/data/queries'
import { Pill } from '@/components/ui/Pill'
import { VideoModal } from '@/components/VideoModal'

const FILTERS = ['All', 'Back', 'Chest', 'Legs', 'Arms', 'Shoulders', 'Core'] as const
type Filter = (typeof FILTERS)[number]

const FILTER_MUSCLE_GROUPS: Record<Filter, string[]> = {
  All: [],
  Back: ['Back'],
  Chest: ['Chest'],
  Legs: ['Legs'],
  Arms: ['Biceps', 'Triceps'],
  Shoulders: ['Shoulders'],
  Core: ['Core'],
}

interface Props {
  exercises: Exercise[]
}

export function ExercisesClient({ exercises }: Props) {
  const [activeFilter, setActiveFilter] = useState<Filter>('All')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [videoOpen, setVideoOpen] = useState(false)
  const [videoExercise, setVideoExercise] = useState<Exercise | null>(null)

  const filtered = useMemo(() => {
    let result = exercises
    if (activeFilter !== 'All') {
      const groups = FILTER_MUSCLE_GROUPS[activeFilter]
      result = result.filter((ex) => groups.includes(ex.muscle_group))
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((ex) => ex.name.toLowerCase().includes(q))
    }
    return result
  }, [exercises, activeFilter, searchQuery])

  function openVideo(ex: Exercise, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setVideoExercise(ex)
    setVideoOpen(true)
  }

  function toggleSearch() {
    setSearchOpen((o) => !o)
    setSearchQuery('')
  }

  return (
    <main className="px-5 pt-6 pb-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-h1 font-medium">Exercises</h1>
        <button
          onClick={toggleSearch}
          className="w-9 h-9 flex items-center justify-center rounded-full active:scale-[0.95] transition-transform"
          style={{ background: 'var(--surface)', border: '0.5px solid var(--border)' }}
          aria-label={searchOpen ? 'Close search' : 'Search exercises'}
        >
          {searchOpen ? (
            <X size={16} style={{ color: 'var(--text-secondary)' }} />
          ) : (
            <Search size={16} style={{ color: 'var(--text-secondary)' }} />
          )}
        </button>
      </div>

      {/* Search input */}
      {searchOpen && (
        <input
          autoFocus
          type="text"
          placeholder="Search exercises…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-body"
          style={{
            background: 'var(--surface)',
            border: '0.5px solid var(--border)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
      )}

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 no-scrollbar">
        {FILTERS.map((f) => (
          <Pill key={f} active={activeFilter === f} onClick={() => setActiveFilter(f)}>
            {f}
          </Pill>
        ))}
      </div>

      {/* Exercise list */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <p
            className="text-center py-10 text-body"
            style={{ color: 'var(--text-secondary)' }}
          >
            No exercises found
          </p>
        )}

        {filtered.map((ex) => (
          <Link
            key={ex.id}
            href={`/exercises/${ex.id}`}
            className="flex items-center gap-3 rounded-xl active:scale-[0.98] transition-transform"
            style={{
              background: 'var(--surface)',
              border: '0.5px solid var(--border)',
              padding: '10px 14px',
            }}
          >
            {/* Play icon box */}
            <button
              onClick={(e) => openVideo(ex, e)}
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 active:scale-[0.92] transition-transform"
              style={{ background: 'var(--bg)' }}
              aria-label={`Watch ${ex.name} video`}
            >
              <Play size={16} fill="var(--accent)" style={{ color: 'var(--accent)' }} />
            </button>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p
                className="text-body font-medium truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {ex.name}
              </p>
              <p className="text-label-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {ex.muscle_group}
                {ex.secondary_muscles ? ` · ${ex.secondary_muscles}` : ' · —'}
              </p>
            </div>

            <ChevronRight
              size={16}
              style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}
            />
          </Link>
        ))}
      </div>

      {/* Video Modal */}
      {videoExercise && (
        <VideoModal
          open={videoOpen}
          onClose={() => {
            setVideoOpen(false)
            setVideoExercise(null)
          }}
          exerciseName={videoExercise.name}
          muscleGroup={videoExercise.muscle_group}
          secondaryMuscles={videoExercise.secondary_muscles}
          videoUrl={videoExercise.video_url}
          formCues={videoExercise.form_cues}
        />
      )}
    </main>
  )
}
