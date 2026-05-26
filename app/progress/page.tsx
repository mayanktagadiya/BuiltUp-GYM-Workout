import {
  getMostRecentlyLoggedExercise,
  getAllExercisesGroupedByMuscle,
  getExerciseProgressData,
  getExerciseStats,
} from '@/lib/data/queries'
import { ProgressClient } from './ProgressClient'

export default async function ProgressPage() {
  const [defaultExercise, exerciseGroups] = await Promise.all([
    getMostRecentlyLoggedExercise(),
    getAllExercisesGroupedByMuscle(),
  ])

  const [initialProgressData, initialStats] = defaultExercise
    ? await Promise.all([
        getExerciseProgressData(defaultExercise.id),
        getExerciseStats(defaultExercise.id),
      ])
    : [[], { current: null, best: null, deltaLast30Days: null }]

  return (
    <ProgressClient
      exerciseGroups={exerciseGroups}
      defaultExercise={defaultExercise}
      initialProgressData={initialProgressData}
      initialStats={initialStats}
    />
  )
}
