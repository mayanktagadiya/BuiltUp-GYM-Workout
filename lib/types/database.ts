export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      exercises: {
        Row: {
          id: string
          name: string
          muscle_group: string
          secondary_muscles: string | null
          video_url: string | null
          form_cues: string | null
          default_weight_kg: number | null
          equipment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          muscle_group: string
          secondary_muscles?: string | null
          video_url?: string | null
          form_cues?: string | null
          default_weight_kg?: number | null
          equipment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          muscle_group?: string
          secondary_muscles?: string | null
          video_url?: string | null
          form_cues?: string | null
          default_weight_kg?: number | null
          equipment?: string | null
          created_at?: string
        }
      }
      workout_days: {
        Row: {
          id: string
          day_of_week: number
          name: string
          subtitle: string | null
          is_rest_day: boolean
          created_at: string
        }
        Insert: {
          id?: string
          day_of_week: number
          name: string
          subtitle?: string | null
          is_rest_day?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          day_of_week?: number
          name?: string
          subtitle?: string | null
          is_rest_day?: boolean
          created_at?: string
        }
      }
      workout_day_exercises: {
        Row: {
          id: string
          workout_day_id: string
          exercise_id: string
          order_index: number
          target_sets: number
          target_reps_per_set: number[]
          rest_seconds: number
          notes: string | null
        }
        Insert: {
          id?: string
          workout_day_id: string
          exercise_id: string
          order_index: number
          target_sets: number
          target_reps_per_set: number[]
          rest_seconds?: number
          notes?: string | null
        }
        Update: {
          id?: string
          workout_day_id?: string
          exercise_id?: string
          order_index?: number
          target_sets?: number
          target_reps_per_set?: number[]
          rest_seconds?: number
          notes?: string | null
        }
      }
      workout_sessions: {
        Row: {
          id: string
          user_id: string | null
          workout_day_id: string
          started_at: string
          completed_at: string | null
          duration_seconds: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          workout_day_id: string
          started_at?: string
          completed_at?: string | null
          duration_seconds?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          workout_day_id?: string
          started_at?: string
          completed_at?: string | null
          duration_seconds?: number | null
          notes?: string | null
        }
      }
      set_logs: {
        Row: {
          id: string
          session_id: string
          exercise_id: string
          set_number: number
          weight_kg: number | null
          reps: number | null
          completed_at: string
          notes: string | null
          is_personal_record: boolean
        }
        Insert: {
          id?: string
          session_id: string
          exercise_id: string
          set_number: number
          weight_kg?: number | null
          reps?: number | null
          completed_at?: string
          notes?: string | null
          is_personal_record?: boolean
        }
        Update: {
          id?: string
          session_id?: string
          exercise_id?: string
          set_number?: number
          weight_kg?: number | null
          reps?: number | null
          completed_at?: string
          notes?: string | null
          is_personal_record?: boolean
        }
      }
      body_weight_logs: {
        Row: {
          id: string
          user_id: string | null
          weight_kg: number
          logged_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          weight_kg: number
          logged_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          weight_kg?: number
          logged_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          weight_unit: string
          default_rest_seconds: number
          sound_enabled: boolean
          vibration_enabled: boolean
          name: string | null
          starting_weight_kg: number | null
          starting_date: string | null
          default_dumbbell_kg: number | null
          default_machine_kg: number | null
          default_barbell_kg: number | null
        }
        Insert: {
          id?: string
          weight_unit?: string
          default_rest_seconds?: number
          sound_enabled?: boolean
          vibration_enabled?: boolean
          name?: string | null
          starting_weight_kg?: number | null
          starting_date?: string | null
          default_dumbbell_kg?: number | null
          default_machine_kg?: number | null
          default_barbell_kg?: number | null
        }
        Update: {
          id?: string
          weight_unit?: string
          default_rest_seconds?: number
          sound_enabled?: boolean
          vibration_enabled?: boolean
          name?: string | null
          starting_weight_kg?: number | null
          starting_date?: string | null
          default_dumbbell_kg?: number | null
          default_machine_kg?: number | null
          default_barbell_kg?: number | null
        }
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
  }
}
