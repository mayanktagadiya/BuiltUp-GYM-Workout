# Changelog

## v1.1.0 — 2026-05-29

### Added

- **Equipment-based default weights** — workout sets are now pre-filled based on exercise equipment type and user preferences. Dumbbells default to `default_dumbbell_kg`, machines/cables to `default_machine_kg`, barbells to `default_barbell_kg` (all stored in `user_preferences`). Falls back to 5 kg / 50 kg / 20 kg if the user hasn't set a preference yet.
- **Default weights section in Settings** — three number inputs (Dumbbell, Machine / Cable, Barbell) added between Preferences and Data sections. Values are debounced-saved to Supabase and immediately reflected in the next workout session.

### Changed

- Settings screen version bump: 1.0.0 → 1.1.0

### Database

Two columns added to `exercises` table and three columns added to `user_preferences`:
```sql
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS equipment text;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS default_dumbbell_kg numeric;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS default_machine_kg numeric;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS default_barbell_kg numeric;
```

---

## v1.0.0 — 2026-05-29

### Added

- **Settings screen** (`app/settings/page.tsx`) — client component with four sections:
  - PROFILE: Name (editable text, debounced Supabase sync), Starting weight (optional kg, debounced sync), Member since (read-only date from `user_preferences.starting_date`)
  - PREFERENCES: Weight unit segmented control (kg / lb), Default rest time segmented control (60s / 90s / 120s), Sound on rest complete toggle, Vibration on rest complete toggle — all saved to `user_preferences` immediately and mirrored to localStorage
  - DATA: "Export all data" button (generates CSV of all set_logs + sessions + exercises, triggers browser download via `Blob + URL.createObjectURL`), "Reset all data" button with inline confirmation dialog (deletes all rows from `set_logs`, `workout_sessions`, `body_weight_logs`)
  - ABOUT: Version 1.0.0, "Built for May", privacy note
- **`lib/data/preferences.ts`** — `getUserPreferences()` (fetches Supabase row, creates default on first launch, syncs to localStorage) and `updateUserPreferences(id, partial)` (optimistic localStorage update + async Supabase write). `getLocalPreferences()` returns cached prefs for instant reads
- **`lib/utils/units.ts`** — `kgToLb(kg)`, `lbToKg(lb)`, `formatWeight(kg, unit)` utility functions
- **`components/OfflineBanner.tsx`** — client component, fixed top banner, listens to `window online/offline` events; appears only when `navigator.onLine === false`; initialises to `true` to avoid hydration mismatch
- **`app/offline/page.tsx`** — offline fallback page served by the service worker when navigation fails with no network
- **PWA polish** (`next.config.js`): added `runtimeCaching` with five strategies — `NetworkFirst` for pages and Supabase API, `CacheFirst` for `/_next/static`, images, and Google Fonts; added `fallbacks.document: '/offline'` so the service worker serves the offline page on navigation failure
- **`public/manifest.json`**: added `categories: ["health", "fitness"]`, `id: "/"`, `lang: "en"`; updated description to "Personal workout tracker"
- **`app/globals.css`**: added `-webkit-tap-highlight-color: transparent` on `html`; `button { touch-action: manipulation }` to prevent double-tap zoom; `button:active { transform: scale(0.97); transition: transform 60ms }` for snappy press feedback on all raw buttons
- **`app/layout.tsx`**: `OfflineBanner` added to root layout
- **`DEPLOY.md`**: step-by-step guide covering Supabase setup, GitHub push, Vercel deploy, iPhone test, PWA install, friend sharing, and custom domain

### Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript strict |
| Styling | Tailwind CSS + shadcn/ui (neutral base) |
| State | Zustand with persist middleware |
| Database | Supabase (Postgres) |
| Charts | Recharts |
| Animations | framer-motion |
| PWA | next-pwa (Workbox) |
| Hosting | Vercel |

### Build credits

Built by Claude Code for May. RMIT 2026.

---

## v0.8.0 — 2026-05-29

### Added

- **`lib/utils/youtube.ts`** — `extractYouTubeId(url)` helper; handles `youtube.com/watch?v=`, `youtu.be/`, `/embed/`, `/shorts/` URL formats
- **`components/LiteYoutubeEmbed.tsx`** — reusable client component; renders YouTube thumbnail with gold play-button overlay, swaps to `<iframe autoplay>` on tap; shows "Video coming soon" black box for PLACEHOLDER/missing URLs; used on exercise detail page
- **`components/VideoModal.tsx`** — framer-motion bottom sheet (70vh, slides up from bottom, backdrop tap or X to close); contains the same lite-youtube embed pattern plus form cues text and optional "View on YouTube" link; `playing` state resets when modal closes
- **Data layer additions** (`lib/data/queries.ts`):
  - `Exercise` type — full exercise row with all columns
  - `getAllExercises()` — returns all exercises ordered by muscle group + name
  - `getExerciseById(id)` — single exercise by UUID
  - `getWorkoutDaysContainingExercise(exerciseId)` — returns `WorkoutDayForExercise[]` (workoutDayId, dayOfWeek, name) sorted by day; used for "Used in" section on detail page
- **Exercise Library** (`app/exercises/page.tsx` + `app/exercises/ExercisesClient.tsx`):
  - Server component fetches all exercises, passes to client component (no loading flash)
  - Header with h1 "Exercises" + search toggle (X closes + clears query)
  - Horizontally scrollable filter chip row (All / Back / Chest / Legs / Arms / Shoulders / Core); "Arms" maps to Biceps + Triceps; active chip gold
  - Inline search input (autofocused when opened) — client-side substring match on name
  - Vertical list: 48×48 gold play-icon box (opens VideoModal, stops Link navigation via stopPropagation) + name + muscle group subtitle + chevron; tapping anywhere else navigates to `/exercises/[id]`
  - Empty state "No exercises found" when filters + search yield nothing
- **Exercise Detail** (`app/exercises/[id]/page.tsx`):
  - Async server component; back arrow → `/exercises`, centered exercise name
  - `LiteYoutubeEmbed` for the 16:9 video area
  - Pill row: primary muscle group (gold/active) + each secondary muscle parsed from comma-separated string
  - "FORM CUES" section with body text (only shown if form_cues is non-null)
  - "USED IN" section — Card list of workout days containing this exercise, each linking to `/workout/[id]`
- **VideoModal wired across app**:
  - `app/HomeExerciseList.tsx` (new client component) — extracted from `app/page.tsx`; manages `videoOpen` + `videoExercise` state; renders exercise cards with functional play buttons; `app/page.tsx` stays a server component
  - `app/workout/[id]/WorkoutSession.tsx` — play button in exercise header now opens VideoModal with current exercise data (name, muscle group, video URL, form cues)

## v0.7.0 — 2026-05-26

### Added

- **Data layer** (`lib/data/queries.ts`) — four new server-side query functions for progress:
  - `getMostRecentlyLoggedExercise()` — returns the most recently logged exercise (used as default selection on Progress tab)
  - `getAllExercisesGroupedByMuscle()` — returns `ExerciseGroup[]` ordered by muscle group + name, for the picker modal
  - `getExerciseProgressData(exerciseId)` — returns `ExerciseProgressPoint[]` (one entry per completed session that contained this exercise): `date`, `weekLabel` (`W1`, `W2`… relative to first session), `topSetWeight`, `topSetReps`, `estimated1RM` (Epley formula `weight × (1 + reps/30)`)
  - `getExerciseStats(exerciseId)` — returns `{ current, best, deltaLast30Days }` — current is the most recent session's top set, best is the all-time heaviest set, delta is current weight minus weight ~30 days ago
  - All progress queries use a 2-query pattern (sessions first, then set_logs `.in(sessionIds)`) for reliable completed-session filtering
- **Progress screen** (`app/progress/page.tsx` + `app/progress/ProgressClient.tsx`):
  - Server component fetches initial data (default exercise + its chart data + stats) and passes to client component as props — no loading flash on first paint
  - Muscle group pill row (All / Back / Chest / Legs / Arms / Shoulders / Core) sets initial filter for the picker
  - Exercise selector `Card` (search icon + exercise name + chevron) opens `ExercisePickerSheet`
  - 3-column `StatTile` row: CURRENT (`{weight}kg`), +30 DAYS (signed delta, green/red), BEST (gold accent)
  - **Recharts `LineChart`**: dark theme (CartesianGrid `var(--border)` dashed, axes `var(--text-secondary)` 9px), primary gold line for estimated 1RM (`strokeWidth=2`), faded dashed secondary line for raw top-set weight, hollow dots on all points, filled gold dot on the latest point, no tooltip
  - Empty state: TrendingUp icon + "Start logging to see your progress"
  - Loading state while re-fetching after exercise change
  - **Recent Sessions** section: last 5 sessions for the exercise, compact cards with date + `{weight}kg × {reps}` right-aligned tabular nums
  - When exercise changes, re-fetches via browser Supabase client (no page reload)
- **ExercisePickerSheet** (`components/ExercisePickerSheet.tsx`) — framer-motion bottom sheet (80% screen height):
  - Drag handle + close button
  - Search input filters exercise list case-insensitively
  - Filter chips (All / Back / Chest / Legs / Arms / Shoulders / Core) — "Arms" maps to Biceps + Triceps muscle groups
  - Scrollable grouped list with section headers; selected exercise highlighted in gold with checkmark
  - Backdrop click closes sheet; selecting exercise closes sheet and loads its data

## v0.6.0 — 2026-05-24

### Added

- **Data layer additions** (`lib/data/queries.ts`):
  - `getSessionHistory()` — returns all completed `workout_sessions` ordered desc, joined with `workout_days` for name, plus aggregated stats (duration, total_sets_logged, total_volume_kg, pr_count) via a 2-query batch (no N+1)
  - `getSessionStats(sessionId)` — returns `{ duration_seconds, sets_done, total_sets, volume_kg, prs[] }` for a single session
  - `getStreak()` — returns `{ current, best }` consecutive-day streak computed from all completed sessions
- **Workout Complete screen** (`app/workout/[id]/complete/page.tsx`) — client component navigated to automatically when `finishWorkout` sets `isCompleted: true`:
  - Redirects to `/` if `currentSession.id` is null (direct navigation guard)
  - Computes DURATION / SETS DONE / VOLUME from Zustand store (no extra DB hit); fetches accurate `duration_seconds` from the session row
  - **PR detection**: for each set_log in the session, queries historical max weight at ≥ same reps before session start; marks new PRs with `is_personal_record = true` in DB
  - **Streak**: counts consecutive calendar days backward from today across all completed sessions; computes personal best
  - Layout: gold checkmark circle → h1 "Workout complete" → day name · weekday subtitle → 2×2 StatTile grid → gold PR card (conditionally shown) → flame + streak count with "Personal best" label when current === best → full-width "Done" button
  - "Done" calls `resetSession()` then navigates to `/`
- **History tab** (`app/history/page.tsx`) — async server component:
  - Empty state: dumbbell icon + "No workouts logged yet" + subtitle
  - Sessions grouped by calendar week (Monday start, via `date-fns startOfWeek`)
  - Week label "Week of MMM D" above each group
  - Per-session card: day name + date, stats row (duration · sets · volume · PR badge)
- **SessionCard** (`app/history/SessionCard.tsx`) — client component; `onClick` shows "Detail view coming soon" alert (detail screen deferred to v2)

---

## v0.5.0 — 2026-05-24

### Added

- **framer-motion** installed for animated overlays
- **Zustand workout store** (`lib/store/workoutStore.ts`) — full rewrite with persist middleware (localStorage, key `buildup-workout-v2`). State: `currentSession`, `exercises`, `currentExerciseIndex`, `setLogs`, `restTimer`, `offlineQueue`, `isCompleted`. Actions: `startSession` (creates `workout_sessions` row, initialises per-set log entries), `updateSet`, `completeSet` (writes `set_logs` to Supabase; queues offline), `uncompleteSet` (deletes DB row + clears offline queue entry), `advanceToNextExercise`, `goToExercise`, `startRest`, `tickRest`, `skipRest` (auto-advances to next exercise when last set of exercise was completed), `addRestTime`, `setRestPreset` (proportional remaining time), `finishWorkout` (updates `completed_at` + `duration_seconds`, sets `isCompleted: true`), `syncOfflineQueue`, `resetSession`. `restTimer` and `isCompleted` are intentionally NOT persisted.
- **`getPreviousSessionLogs`** (`lib/data/queries.ts`) — fetches most-recent completed session for a workout day and returns `Record<exerciseId, [{weight_kg, reps}]>` for previous-session display and weight defaults.
- **Active Workout screen** (`app/workout/[id]/page.tsx` + `app/workout/[id]/WorkoutSession.tsx`) — server component fetches workout + previous logs; client component handles all interaction:
  - Top bar: X (exit confirm dialog), "EXERCISE N OF M" counter, ⋮ (options bottom sheet with Skip / Watch video / Replace — last is coming-soon)
  - Full-width `ProgressBar` tracking total completed sets across all exercises
  - Exercise header: name (h1), muscle group + set count subtitle, play icon → `#` (video modal Prompt 8)
  - "Last session" line using previous session's set 1 weight/reps; "First time — start light" when no history
  - Set cards: **completed** (opacity 55%, green `CheckCircle2`, weight + reps display, edit pencil), **active** (gold border + accent-bg `Card`, two `NumberInput` boxes in inner `bg-[var(--bg)]` cards — weight step 2.5kg, reps step 1 — plus "Complete set" primary button), **future** (surface card, tertiary placeholders)
  - Editing a completed set: calls `uncompleteSet`, re-opens as active, clears offline queue duplicate
  - Previous / Next exercise navigation arrows (shown when applicable)
  - Offline pill: "Offline — will sync" shown when `navigator.onLine === false`; `syncOfflineQueue` called on reconnect
  - Session resumes from localStorage on re-visit; re-initializes only when workout day changes
- **Rest timer overlay** (`components/RestTimer.tsx`) — framer-motion `AnimatePresence` slide-up from bottom, 60 vh, fixed position, `max-w-md` centered:
  - Completed set summary label (exercise name, set N, weight × reps)
  - 64px tabular-nums gold countdown (turns red ≤ 5s); "of Xm:ss" subtitle
  - Gold `ProgressBar`
  - Three preset buttons (60s / 90s / 120s); active preset has gold border; switching changes remaining proportionally
  - "+15s" and "Skip rest" buttons
  - "NEXT UP" card: next set or next exercise; smart weight suggestion (≥ target reps → +2.5kg green ↑; < target → same weight)
  - On reaching zero: `navigator.vibrate([200,100,200])`, 440 Hz Web Audio sine beep for 200 ms, auto-dismiss after 1 s
  - Auto-advance: after dismissal, `skipRest` calls `advanceToNextExercise` if the just-completed set was the last of its exercise; when past last exercise, `finishWorkout` is called and component navigates to `/workout/[id]/complete` (404 until Prompt 6)

---

## v0.4.0 — 2026-05-24

### Added

- **Data layer** (`lib/data/queries.ts`) — five server-side query functions: `getCurrentDayOfWeek()` (Mon=1 … Sun=7), `getCurrentWeekNumber()` (reads/creates `user_preferences.starting_date`, returns weeks elapsed + 1), `getTodaysWorkout()` (workout day + exercises with full exercise join ordered by `order_index`), `getWeekWorkouts()` (all 7 days with `exercise_count` + `total_sets` via single join query), `getWorkoutDay(id)` (full day + exercises by id for use in Prompt 5). Helper `estimateWorkoutMinutes(totalSets)` returns `Math.round(totalSets * 1.5)`.
- **Home / Today screen** (`app/page.tsx`) — async server component. Header: day + week label, h1 workout name, gold subtitle, calendar-icon link to `/week`. 3-column stat grid (EXERCISES / SETS / EST. TIME). "TODAY'S WORKOUT" section with first 3 exercise cards (name, sets · reps, gold play icon linking `#`). `+N more` placeholder card when exercises > 3. Full-width "Start workout" CTA → `/workout/[id]`. Rest-day state shows centered message + "View week" link.
- **Week Overview screen** (`app/week/page.tsx`) — async server component. Header: back arrow → `/`, centered "Week N" title, dots-vertical placeholder. Vertical list of 7 day cards: today highlighted with gold active border, pulse dot, "MON · TODAY" label; workout days show name + `N exercises · Nm`; rest days shown at opacity-60 with no chevron. Tapping any workout card routes to `/workout/[id]`.

---

## v0.3.0 — 2026-05-21

### Added

- **Root layout** (`app/layout.tsx`) — Inter font variable on `<html>`, `bg-background text-foreground font-sans antialiased` body, `max-w-md` page container with `calc(6rem + env(safe-area-inset-bottom))` bottom clearance, BottomNav injected globally
- **BottomNav** (`components/BottomNav.tsx`) — fixed bottom, `max-w-md` centered, 4 tabs (Today / History / Progress / Settings), gold active state via `usePathname()`, safe-area-inset bottom padding, 0.5px border-top, rounded-t-2xl
- **Card** — `active` variant (gold border + accent-bg), optional `onClick` with `active:scale-[0.98]`
- **StatTile** — uppercase 10px label + 22px tabular-nums value, 4 color variants (`default` / `accent` / `success` / `danger`)
- **Button** — 3 variants (`primary` gold, `secondary`, `ghost`), 3 sizes (`sm` / `md` / `lg`), `fullWidth`, disabled state
- **NumberInput** — label, `[-]` / `[+]` 32px steppers, 22px tabular-nums display, tap-to-edit inline number input, `min` / `max` / `step` / `suffix`
- **ProgressBar** — 4px track, gold fill, smooth `transition-all`
- **Pill** — active (gold bg, black text) / inactive filter chip, rounded-full
- **Section** — uppercase 11px section label with children below
- **Placeholder home page** — "BuiltUp" + "Coming together..." subtitle

---

## v0.2.0 — 2026-05-20

### Added

- **Schema migration** `supabase/migrations/001_initial_schema.sql` — all 7 tables (`exercises`, `workout_days`, `workout_day_exercises`, `workout_sessions`, `set_logs`, `body_weight_logs`, `user_preferences`) with 4 performance indexes
- **Seed file** `supabase/seed.sql` — 44 exercises across 7 muscle groups (Back, Chest, Shoulders, Biceps, Triceps, Legs, Core), all 7 workout days (Mon–Sun, Sat/Sun as rest days), and all workout_day_exercises rows with the locked rep arrays from the workout plan. Exercise UUIDs resolved at seed time via name-based subqueries.
- **TypeScript `Database` type** `lib/types/database.ts` — Supabase-cli-style `Row`/`Insert`/`Update` mappings for all 7 tables, ready to use with `createBrowserClient<Database>()`
- **README** — "Database setup" section with step-by-step Supabase SQL Editor instructions

---

## v0.1.0 — 2026-05-20

### Added

- **Next.js 14** project scaffolded with App Router and TypeScript (`strict` mode)
- **Tailwind CSS** configured with custom dark design tokens matching the BuiltUp design system
- **shadcn/ui** initialized (`components.json`, neutral base, CSS variables, RSC-compatible)
- **Packages installed**: `zustand`, `recharts`, `lucide-react`, `date-fns`, `@supabase/supabase-js`, `@supabase/ssr`, `next-pwa`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`
- **Design tokens** in `app/globals.css` as `:root` CSS variables: `--bg`, `--surface`, `--surface-hover`, `--border`, `--text-primary`, `--text-secondary`, `--text-tertiary`, `--accent`, `--accent-bg`, `--success`, `--danger`
- **Inter font** loaded via `next/font/google` with `--font-inter` CSS variable
- **PWA configuration** (`next.config.js` with `next-pwa`, `skipWaiting`, `clientsClaim`)
- **Web App Manifest** (`public/manifest.json`) — name "BuiltUp", standalone display, portrait orientation, `#0A0A0A` theme/background
- **Apple PWA meta tags** in `app/layout.tsx`: `apple-mobile-web-app-capable`, `black-translucent` status bar, splash screen entries for 5 iPhone models
- **Placeholder icons**: `public/apple-touch-icon.png` (180×180), `public/icons/icon-192x192.png`, `public/icons/icon-512x512.png` (solid black — replace with real artwork in prompt 9)
- **Folder structure**: `/app`, `/components`, `/components/ui`, `/lib`, `/lib/supabase`, `/lib/store`, `/lib/types`, `/lib/data`
- **Supabase clients**: `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (RSC)
- **Zustand store**: `lib/store/workout-store.ts` with `persist` middleware for offline support
- **TypeScript types**: `lib/types/index.ts` — full data model interfaces matching the SQL schema
- **`lib/utils.ts`**: `cn()` helper (`clsx` + `tailwind-merge`)
- **`.env.local.example`** with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` placeholders
- **Git repo initialized** with `.gitignore` (Next.js + node_modules + `.env.local` + Vercel + PWA service worker output) and `.gitattributes` for LF line endings
- **iOS UX globals**: `overscroll-behavior: none` (no bounce), touch-callout disabled, `user-select: none` on UI elements with input overrides, tabular-nums utility class
