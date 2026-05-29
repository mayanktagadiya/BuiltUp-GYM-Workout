'use client'

import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import {
  getUserPreferences,
  getLocalPreferences,
  updateUserPreferences,
  type UserPreferences,
} from '@/lib/data/preferences'
import { cn } from '@/lib/utils'

// ─── Sub-components ───────────────────────────────────────────────────────────

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div
      className="flex rounded-lg overflow-hidden shrink-0"
      style={{ background: 'var(--bg)', border: '0.5px solid var(--border)' }}
    >
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            'px-3 py-1.5 text-xs transition-colors',
            opt === value ? 'text-black' : 'text-[var(--text-secondary)]'
          )}
          style={opt === value ? { background: 'var(--accent)' } : undefined}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="relative shrink-0 w-[46px] h-[26px] rounded-full transition-colors"
      style={{
        background: value ? 'var(--accent)' : 'var(--surface-hover)',
        border: '0.5px solid var(--border)',
      }}
    >
      <span
        className="absolute top-[3px] w-[20px] h-[20px] rounded-full bg-white transition-transform"
        style={{ transform: value ? 'translateX(22px)' : 'translateX(3px)' }}
      />
    </button>
  )
}

function Row({
  label,
  border = true,
  children,
}: {
  label: string
  border?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-3.5"
      style={{ borderBottom: border ? '0.5px solid var(--border)' : undefined }}
    >
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      {children}
    </div>
  )
}

// ─── CSV export ───────────────────────────────────────────────────────────────

type ExportSession = {
  id: string
  started_at: string
  workout_days: { name: string } | null
}

type ExportLog = {
  session_id: string
  set_number: number
  weight_kg: number | null
  reps: number | null
  completed_at: string
  is_personal_record: boolean
  exercises: { name: string; muscle_group: string } | null
}

async function exportCSV() {
  const supabase = createClient()

  const { data: rawSessions } = await supabase
    .from('workout_sessions')
    .select('id, started_at, workout_days(name)')
    .not('completed_at', 'is', null)

  const sessions = (rawSessions ?? []) as unknown as ExportSession[]
  if (sessions.length === 0) {
    alert('No workout data to export yet.')
    return
  }

  const sessionIds = sessions.map((s) => s.id)
  const sessionMap = new Map(sessions.map((s) => [s.id, s]))

  const { data: rawLogs } = await supabase
    .from('set_logs')
    .select(
      'session_id, set_number, weight_kg, reps, completed_at, is_personal_record, exercises(name, muscle_group)'
    )
    .in('session_id', sessionIds)
    .order('completed_at')

  const logs = (rawLogs ?? []) as unknown as ExportLog[]
  if (logs.length === 0) {
    alert('No set data to export yet.')
    return
  }

  const header = ['Date', 'Day', 'Exercise', 'Muscle Group', 'Set', 'Weight (kg)', 'Reps', 'PR']
  const rows = logs.map((log) => {
    const session = sessionMap.get(log.session_id)
    return [
      log.completed_at.split('T')[0],
      session?.workout_days?.name ?? '',
      log.exercises?.name ?? '',
      log.exercises?.muscle_group ?? '',
      String(log.set_number),
      log.weight_kg != null ? String(log.weight_kg) : '',
      log.reps != null ? String(log.reps) : '',
      log.is_personal_record ? 'Yes' : 'No',
    ]
  })

  const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `buildup-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function resetAllData() {
  const supabase = createClient()
  // Delete in dependency order; cascade handles set_logs when sessions go
  await supabase.from('set_logs').delete().not('id', 'is', null)
  await supabase.from('workout_sessions').delete().not('id', 'is', null)
  await supabase.from('body_weight_logs').delete().not('id', 'is', null)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetting, setResetting] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Instant paint from cache
    const local = getLocalPreferences()
    if (local) {
      setPrefs(local)
      setLoading(false)
    }
    // Authoritative data from Supabase
    getUserPreferences().then((p) => {
      setPrefs(p)
      setLoading(false)
    })
  }, [])

  function update<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    if (!prefs) return
    const id = prefs.id
    setPrefs({ ...prefs, [key]: value })
    updateUserPreferences(id, { [key]: value })
  }

  function updateDebounced<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    if (!prefs) return
    const id = prefs.id
    setPrefs({ ...prefs, [key]: value })
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateUserPreferences(id, { [key]: value })
    }, 600)
  }

  async function handleReset() {
    setResetting(true)
    try {
      await resetAllData()
      setConfirmReset(false)
    } finally {
      setResetting(false)
    }
  }

  if (loading && !prefs) {
    return (
      <div className="px-5 pt-8">
        <h1 className="text-h1 font-medium mb-6" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
          Loading...
        </p>
      </div>
    )
  }

  const memberSince = prefs?.starting_date
    ? format(new Date(prefs.starting_date + 'T00:00:00'), 'MMM d, yyyy')
    : '—'

  return (
    <div className="px-5 pt-8 pb-6 flex flex-col gap-6">
      <h1 className="text-h1 font-medium" style={{ color: 'var(--text-primary)' }}>
        Settings
      </h1>

      {/* PROFILE */}
      <Section label="Profile">
        <Card className="p-0 overflow-hidden">
          <Row label="Name">
            <input
              type="text"
              value={prefs?.name ?? ''}
              onChange={(e) => updateDebounced('name', e.target.value || null)}
              placeholder="Your name"
              className="text-right bg-transparent outline-none text-sm w-40"
              style={{ color: 'var(--text-primary)' }}
            />
          </Row>
          <Row label="Starting weight">
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number"
                value={prefs?.starting_weight_kg ?? ''}
                onChange={(e) =>
                  updateDebounced(
                    'starting_weight_kg',
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                placeholder="—"
                step="0.5"
                min="0"
                className="text-right bg-transparent outline-none text-sm w-16"
                style={{ color: 'var(--text-primary)' }}
              />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                kg
              </span>
            </div>
          </Row>
          <Row label="Member since" border={false}>
            <span className="text-sm shrink-0" style={{ color: 'var(--text-primary)' }}>
              {memberSince}
            </span>
          </Row>
        </Card>
      </Section>

      {/* PREFERENCES */}
      <Section label="Preferences">
        <Card className="p-0 overflow-hidden">
          <Row label="Weight unit">
            <SegmentedControl
              options={['kg', 'lb']}
              value={prefs?.weight_unit ?? 'kg'}
              onChange={(v) => update('weight_unit', v as 'kg' | 'lb')}
            />
          </Row>
          <Row label="Default rest">
            <SegmentedControl
              options={['60s', '90s', '120s']}
              value={`${prefs?.default_rest_seconds ?? 90}s`}
              onChange={(v) => update('default_rest_seconds', parseInt(v))}
            />
          </Row>
          <Row label="Sound on rest complete">
            <Toggle
              value={prefs?.sound_enabled ?? true}
              onChange={(v) => update('sound_enabled', v)}
            />
          </Row>
          <Row label="Vibration on rest complete" border={false}>
            <Toggle
              value={prefs?.vibration_enabled ?? true}
              onChange={(v) => update('vibration_enabled', v)}
            />
          </Row>
        </Card>
      </Section>

      {/* DEFAULT WEIGHTS */}
      <Section label="Default weights">
        <Card className="p-0 overflow-hidden">
          <Row label="Dumbbell (each)">
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number"
                value={prefs?.default_dumbbell_kg ?? ''}
                onChange={(e) =>
                  updateDebounced('default_dumbbell_kg', e.target.value ? Number(e.target.value) : null)
                }
                placeholder="5"
                step="0.5"
                min="0"
                className="text-right bg-transparent outline-none text-sm w-16"
                style={{ color: 'var(--text-primary)' }}
              />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>kg</span>
            </div>
          </Row>
          <Row label="Machine / Cable">
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number"
                value={prefs?.default_machine_kg ?? ''}
                onChange={(e) =>
                  updateDebounced('default_machine_kg', e.target.value ? Number(e.target.value) : null)
                }
                placeholder="50"
                step="5"
                min="0"
                className="text-right bg-transparent outline-none text-sm w-16"
                style={{ color: 'var(--text-primary)' }}
              />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>kg</span>
            </div>
          </Row>
          <Row label="Barbell" border={false}>
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number"
                value={prefs?.default_barbell_kg ?? ''}
                onChange={(e) =>
                  updateDebounced('default_barbell_kg', e.target.value ? Number(e.target.value) : null)
                }
                placeholder="20"
                step="2.5"
                min="0"
                className="text-right bg-transparent outline-none text-sm w-16"
                style={{ color: 'var(--text-primary)' }}
              />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>kg</span>
            </div>
          </Row>
        </Card>
      </Section>

      {/* DATA */}
      <Section label="Data">
        <Card className="p-0 overflow-hidden">
          <button
            onClick={exportCSV}
            className="w-full flex items-center justify-between px-4 py-3.5 text-sm text-left"
            style={{
              borderBottom: '0.5px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            Export all data
            <span style={{ color: 'var(--text-secondary)' }}>CSV ↓</span>
          </button>

          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full flex items-center px-4 py-3.5 text-sm text-left"
              style={{ color: 'var(--danger)' }}
            >
              Reset all data
            </button>
          ) : (
            <div className="px-4 py-4" style={{ borderTop: '0.5px solid var(--border)' }}>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                This will permanently delete all your workouts. Are you sure?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm"
                  style={{
                    background: 'var(--surface)',
                    color: 'var(--text-primary)',
                    border: '0.5px solid var(--border)',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  disabled={resetting}
                  className="flex-1 py-2.5 rounded-xl text-sm"
                  style={{
                    background: 'var(--danger)',
                    color: 'white',
                    opacity: resetting ? 0.6 : 1,
                  }}
                >
                  {resetting ? 'Deleting...' : 'Delete all'}
                </button>
              </div>
            </div>
          )}
        </Card>
      </Section>

      {/* ABOUT */}
      <Section label="About">
        <Card className="p-0 overflow-hidden">
          <Row label="Version">
            <span className="text-sm shrink-0" style={{ color: 'var(--text-primary)' }}>
              1.1.0
            </span>
          </Row>
          <Row label="Built for">
            <span className="text-sm shrink-0" style={{ color: 'var(--text-primary)' }}>
              May
            </span>
          </Row>
          <div
            className="px-4 py-3.5"
            style={{ borderTop: '0.5px solid var(--border)' }}
          >
            <p className="text-label-sm leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
              All data stored in your private Supabase. No tracking, no ads.
            </p>
          </div>
        </Card>
      </Section>
    </div>
  )
}
