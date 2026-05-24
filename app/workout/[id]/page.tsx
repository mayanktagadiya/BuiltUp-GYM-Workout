import { notFound } from 'next/navigation'
import { getWorkoutDay, getPreviousSessionLogs } from '@/lib/data/queries'
import { WorkoutSession } from './WorkoutSession'

interface Props {
  params: { id: string }
}

export default async function WorkoutPage({ params }: Props) {
  const [workoutData, prevLogs] = await Promise.all([
    getWorkoutDay(params.id),
    getPreviousSessionLogs(params.id),
  ])

  if (!workoutData) notFound()

  return (
    <WorkoutSession
      workoutData={workoutData}
      prevLogs={prevLogs}
      workoutDayId={params.id}
    />
  )
}
