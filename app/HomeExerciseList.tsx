'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { VideoModal } from '@/components/VideoModal'
import type { TodaysWorkoutExercise } from '@/lib/data/queries'

interface Props {
  exercises: TodaysWorkoutExercise[]
}

export function HomeExerciseList({ exercises }: Props) {
  const [videoOpen, setVideoOpen] = useState(false)
  const [videoExercise, setVideoExercise] = useState<TodaysWorkoutExercise | null>(null)

  const visible = exercises.slice(0, 3)
  const remaining = exercises.length - 3

  return (
    <>
      <div className="flex flex-col gap-2">
        {visible.map((wde) => (
          <Card key={wde.id}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p
                  className="text-body font-medium truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {wde.exercise.name}
                </p>
                <p
                  className="text-label-sm mt-0.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {wde.target_sets} sets · {wde.target_reps_per_set.join(', ')}
                </p>
              </div>
              <button
                onClick={() => {
                  setVideoExercise(wde)
                  setVideoOpen(true)
                }}
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 active:scale-[0.92] transition-transform"
                style={{ background: 'var(--bg)' }}
                aria-label={`Watch ${wde.exercise.name} video`}
              >
                <Play size={13} fill="var(--accent)" style={{ color: 'var(--accent)' }} />
              </button>
            </div>
          </Card>
        ))}

        {remaining > 0 && (
          <Card className="opacity-50">
            <p
              className="text-body text-center"
              style={{ color: 'var(--text-secondary)' }}
            >
              +{remaining} more
            </p>
          </Card>
        )}
      </div>

      {videoExercise && (
        <VideoModal
          open={videoOpen}
          onClose={() => {
            setVideoOpen(false)
            setVideoExercise(null)
          }}
          exerciseName={videoExercise.exercise.name}
          muscleGroup={videoExercise.exercise.muscle_group}
          secondaryMuscles={videoExercise.exercise.secondary_muscles}
          videoUrl={videoExercise.exercise.video_url}
          formCues={videoExercise.exercise.form_cues}
        />
      )}
    </>
  )
}
