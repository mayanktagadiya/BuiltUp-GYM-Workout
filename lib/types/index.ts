export type WeightUnit = "kg" | "lbs";

export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  secondary_muscles?: string;
  video_url?: string;
  form_cues?: string;
  created_at: string;
}

export interface WorkoutDay {
  id: string;
  day_of_week: number; // 1=Mon, 7=Sun
  name: string;
  subtitle?: string;
  is_rest_day: boolean;
  created_at: string;
}

export interface WorkoutDayExercise {
  id: string;
  workout_day_id: string;
  exercise_id: string;
  order_index: number;
  target_sets: number;
  target_reps_per_set: number[];
  rest_seconds: number;
  notes?: string;
  exercise?: Exercise;
}

export interface WorkoutSession {
  id: string;
  user_id?: string;
  workout_day_id: string;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  notes?: string;
}

export interface SetLog {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  weight_kg?: number;
  reps?: number;
  completed_at: string;
  notes?: string;
  is_personal_record: boolean;
}

export interface BodyWeightLog {
  id: string;
  user_id?: string;
  weight_kg: number;
  logged_at: string;
}

export interface UserPreferences {
  id: string;
  weight_unit: WeightUnit;
  default_rest_seconds: number;
  sound_enabled: boolean;
  vibration_enabled: boolean;
  name?: string;
  starting_weight_kg?: number;
  starting_date?: string;
}
