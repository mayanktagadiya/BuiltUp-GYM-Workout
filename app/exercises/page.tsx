import { getAllExercises } from '@/lib/data/queries'
import { ExercisesClient } from './ExercisesClient'

export default async function ExercisesPage() {
  const exercises = await getAllExercises()
  return <ExercisesClient exercises={exercises} />
}
