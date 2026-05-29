import { createClient } from '@/lib/supabase/client'

export type UserPreferences = {
  id: string
  weight_unit: 'kg' | 'lb'
  default_rest_seconds: number
  sound_enabled: boolean
  vibration_enabled: boolean
  name: string | null
  starting_weight_kg: number | null
  starting_date: string | null
}

const LS_KEY = 'buildup-prefs'

export function getLocalPreferences(): UserPreferences | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as UserPreferences) : null
  } catch {
    return null
  }
}

function setLocalPreferences(prefs: UserPreferences): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_KEY, JSON.stringify(prefs))
  }
}

export async function getUserPreferences(): Promise<UserPreferences> {
  const supabase = createClient()

  const { data } = await supabase
    .from('user_preferences')
    .select('*')
    .limit(1)
    .maybeSingle()

  if (data) {
    const prefs = data as unknown as UserPreferences
    setLocalPreferences(prefs)
    return prefs
  }

  // Create default row on first launch
  const todayStr = new Date().toISOString().split('T')[0]
  const { data: created } = await supabase
    .from('user_preferences')
    .insert({
      weight_unit: 'kg',
      default_rest_seconds: 90,
      sound_enabled: true,
      vibration_enabled: true,
      starting_date: todayStr,
    })
    .select()
    .single()

  if (created) {
    const prefs = created as unknown as UserPreferences
    setLocalPreferences(prefs)
    return prefs
  }

  // Race condition fallback: another tab may have just inserted
  const { data: retry } = await supabase
    .from('user_preferences')
    .select('*')
    .limit(1)
    .maybeSingle()

  const fallback = (retry ?? {
    id: '',
    weight_unit: 'kg' as const,
    default_rest_seconds: 90,
    sound_enabled: true,
    vibration_enabled: true,
    name: null,
    starting_weight_kg: null,
    starting_date: null,
  }) as unknown as UserPreferences

  setLocalPreferences(fallback)
  return fallback
}

export async function updateUserPreferences(
  id: string,
  partial: Partial<Omit<UserPreferences, 'id'>>
): Promise<void> {
  // Optimistically update localStorage
  const local = getLocalPreferences()
  if (local && id) setLocalPreferences({ ...local, ...partial, id })

  if (!id) return
  const supabase = createClient()
  await supabase.from('user_preferences').update(partial).eq('id', id)
}
