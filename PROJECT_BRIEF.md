# BuiltUp — Project Brief

> **Read this first, every session.** This file is the single source of truth for the BuiltUp project. When starting a new Claude Code session, your first action should always be: read this file end-to-end, then read CHANGELOG.md, then run `git log --oneline` before writing any code.

---

## 1. What we're building

**BuiltUp** is a personal workout tracker PWA (Progressive Web App), built for the project owner ("May") and a small group of friends. It is installed on iPhone via Safari → "Add to Home Screen", and behaves like a native app: dark theme, full-screen, works offline, persists data to Supabase.

It is NOT a public product. It is NOT in the App Store. It is a personal tool with a small trusted user base.

### Core value proposition
Open the app at the gym → see today's workout → log each set → track progress over weeks. No social features. No bloat. No ads. Just the lifter and the log.

### Why PWA (not native)
- Ships in days, not weeks
- No Apple Developer account ($99/yr saved)
- No App Store review
- Works on Windows dev environment (no Mac needed)
- Friends install via Safari → Share → Add to Home Screen (one-time 30-sec setup)
- Code stays the same if we ever wrap with Capacitor later for TestFlight distribution

---

## 2. Tech stack (locked)

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui (neutral base) |
| State | Zustand (with persist middleware for offline) |
| Database | Supabase (Postgres) |
| Auth | None for MVP. Personal use only. Add later if needed. |
| Charts | Recharts |
| Icons | lucide-react |
| Animations | framer-motion (where needed) |
| Date utils | date-fns |
| PWA | next-pwa |
| Hosting | Vercel (free tier) |
| Repo | GitHub |

### Do NOT use
- Redux (overkill, use Zustand)
- styled-components or emotion (use Tailwind)
- Material UI / Chakra (use shadcn/ui)
- Moment.js (use date-fns)
- Server-side auth solutions (no auth for MVP)
- localStorage as the primary DB (Supabase is the source of truth, localStorage only for offline queue + user preferences)

---

## 3. Design system (locked)

### Vibe
Dark, minimal, Instagram-inspired (reference: `tankfitness1` Instagram aesthetic — black canvas, gold accents, monospaced numbers, lots of breathing room).

### Color tokens (CSS variables in globals.css)
```
--bg:            #0A0A0A   /* near-black, primary background */
--surface:       #161616   /* cards, raised elements */
--surface-hover: #1f1f1f   /* hover state */
--border:        #262626   /* 0.5px borders on cards */
--text-primary:  #FAFAFA   /* main text */
--text-secondary:#A3A3A3   /* labels, secondary info */
--text-tertiary: #5a5a5a   /* disabled, placeholder */
--accent:        #D4A574   /* gold — used SPARINGLY for active states, CTAs, PRs */
--accent-bg:     #1a1612   /* gold-tinted dark, for active card backgrounds */
--success:       #4ADE80   /* set completed, positive delta */
--danger:        #EF4444   /* errors, delete confirmations */
```

### Typography
- Font: **Inter** via `next/font/google`
- Numbers (weights, reps, timers): **tabular nums** (`font-variant-numeric: tabular-nums`)
- Heading scale: 26px (h1), 22px (h2), 18px (h3), all weight 500
- Body: 14-15px, weight 400, line-height 1.5
- Small labels: 10-11px uppercase, letter-spacing 0.5px-1px, color var(--text-secondary)
- **Sentence case always** — no Title Case, no ALL CAPS (except small uppercase labels)
- **Two weights only**: 400 regular, 500 medium. Never 600 or 700.

### Layout principles
- Max-width container: `max-w-md mx-auto` (centered on desktop, edge-to-edge on iPhone)
- Generous padding: 16px-20px around screen edges
- Card radius: 12px (border-radius-lg)
- Element radius: 8px (border-radius-md)
- Bottom nav: fixed, rounded top corners, safe-area-inset padding
- All interactive elements: minimum 44px tap target (iOS HIG)
- No gradients. No drop shadows. No glow. No neon.
- 0.5px borders (use `border: 0.5px solid var(--border)`)

### Accent usage rules
The gold (`--accent`) is used SPARINGLY:
- Active bottom-nav tab
- Active set card border + bg
- Primary CTA buttons ("Start workout", "Complete set", "Done")
- PR badges and PR text
- Active filter chip
- Today's card on week overview
- Play icon color on exercise cards

Everything else is grayscale. Restraint is the aesthetic.

---

## 4. The workout plan (locked, do NOT modify)

5-day split. Legs on Friday. Each muscle hit 2x except legs (1x).

### Frequency check
- Back: 2x (Mon heavy, Thu volume)
- Chest: 2x (Tue heavy, Thu volume)
- Biceps: 2x (Mon heavy, Thu pump)
- Triceps: 2x (Tue heavy, Thu pump)
- Shoulders: 1x direct (Wed) + indirect via pressing
- Legs: 1x (Fri only — as requested)

### MONDAY — "Back + Biceps" (Heavy)
1. Lat Pulldown — 4 sets — [12, 10, 10, 8]
2. Close-grip Lat Pulldown — 3 sets — [10, 8, 8]
3. Barbell Row — 4 sets — [10, 8, 8, 6]
4. Single-arm Seated Row — 3 sets — [10, 10, 10]
5. Dumbbell Pullover — 3 sets — [12, 10, 8]
6. Back Extension — 3 sets — [12, 12, 12]
7. Barbell Curl — 4 sets — [10, 8, 8, 6]
8. Incline DB Curl — 3 sets — [12, 10, 8]
9. Hammer Curl — 3 sets — [12, 12, 12]

### TUESDAY — "Chest + Triceps" (Heavy)
1. Incline Barbell Bench Press — 4 sets — [10, 8, 8, 6]
2. Flat Bench Press — 4 sets — [8, 10, 8, 6]
3. Incline DB Press — 3 sets — [10, 10, 8]
4. Cable Fly — 4 sets — [15, 12, 12, 10]
5. Close-grip Bench Press — 3 sets — [10, 8, 8]
6. Skull Crusher — 3 sets — [10, 8, 8]
7. Overhead DB Extension — 3 sets — [12, 10, 8]

### WEDNESDAY — "Shoulders + Abs"
1. Seated Shoulder Press — 4 sets — [10, 8, 8, 6]
2. DB Lateral Raise — 4 sets — [15, 12, 12, 10]
3. Reverse Pec Deck — 4 sets — [15, 12, 12, 10]
4. Upright Row — 3 sets — [10, 10, 8]
5. Shrugs — 3 sets — [12, 12, 12]
6. Hanging Leg Raise — 3 sets — [15, 15, 12]
7. Cable Crunch — 3 sets — [20, 15, 15]

### THURSDAY — "Back + Chest" (Pump/Volume)
1. Seated Cable Row — 4 sets — [12, 10, 8, 8]
2. Straight-arm Pulldown — 3 sets — [12, 12, 12]
3. Face Pull — 3 sets — [15, 15, 15]
4. Cable Crossover — 4 sets — [12, 12, 10, 10]
5. Dips — 3 sets — [10, 10, 10]   (to failure if assisted)
6. Push-ups — 2 sets — [20, 20]   (to failure)
7. Preacher Curl — 3 sets — [12, 10, 8]
8. Cable Tricep Pushdown — 3 sets — [12, 10, 10]

### FRIDAY — "Legs"
1. Barbell Squat — 4 sets — [10, 8, 8, 6]
2. Walking Lunges — 3 sets — [12, 12, 12]
3. Leg Extension — 4 sets — [15, 12, 10, 10]
4. Romanian Deadlift — 3 sets — [10, 8, 8]
5. Lying Leg Curl — 4 sets — [12, 10, 10, 8]
6. Hip Abduction — 3 sets — [15, 15, 15]
7. Hip Adduction — 3 sets — [15, 15, 15]
8. Standing Calf Raise — 4 sets — [20, 15, 15, 15]

### SATURDAY + SUNDAY
Rest days. `is_rest_day = true`, no exercises. Show a "Rest day" screen with friendly message.

### Rep scheme: pyramid sets
The arrays like `[12, 10, 10, 8]` mean weight INCREASES across sets. Set 1 is lightest at 12 reps, set 4 is heaviest at 8 reps. Each set has its own target reps. The data model and UI must support per-set target reps, NOT a single rep number for the whole exercise.

---

## 5. Data model (locked)

```sql
exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  muscle_group text not null,
  secondary_muscles text,
  video_url text,
  form_cues text,
  created_at timestamp default now()
)

workout_days (
  id uuid primary key default gen_random_uuid(),
  day_of_week int not null,           -- 1=Mon, 2=Tue, ..., 7=Sun
  name text not null,
  subtitle text,
  is_rest_day boolean default false,
  created_at timestamp default now()
)

workout_day_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_day_id uuid references workout_days(id) on delete cascade,
  exercise_id uuid references exercises(id),
  order_index int not null,
  target_sets int not null,
  target_reps_per_set int[] not null,
  rest_seconds int default 90,
  notes text
)

workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,                        -- nullable for MVP
  workout_day_id uuid references workout_days(id),
  started_at timestamp not null default now(),
  completed_at timestamp,
  duration_seconds int,
  notes text
)

set_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references workout_sessions(id) on delete cascade,
  exercise_id uuid references exercises(id),
  set_number int not null,
  weight_kg numeric(6,2),
  reps int,
  completed_at timestamp default now(),
  notes text,
  is_personal_record boolean default false
)

body_weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  weight_kg numeric(5,2) not null,
  logged_at timestamp not null default now()
)

user_preferences (
  id uuid primary key default gen_random_uuid(),
  weight_unit text default 'kg',
  default_rest_seconds int default 90,
  sound_enabled boolean default true,
  vibration_enabled boolean default true,
  name text,
  starting_weight_kg numeric(5,2),
  starting_date date
)
```

---

## 6. Screens (locked)

7 core screens, each fully mocked in the design phase:

1. **Home / Today** (`/`) — landing screen, shows today's workout, "Start workout" CTA, week stats
2. **Active Workout / Log Set** (`/workout/[id]`) — log sets, weight + reps inputs per set, video icon, rest timer
3. **Rest Timer** — bottom sheet overlay on active workout, countdown + presets (60/90/120s) + skip/+15s
4. **Workout Complete** (`/workout/[id]/complete`) — summary, PRs, streak, "Done" button
5. **Week Overview** (`/week`) — all 7 days, today highlighted in gold, tap to preview
6. **Progress** (`/progress`) — per-exercise chart, current/+30d/best stats, recent sessions
7. **Exercise Library** (`/exercises`) — browse all exercises, filter by muscle group, video modal

Plus: **Settings** (`/settings`), **History** (`/history`), **Exercise Detail** (`/exercises/[id]`).

Bottom nav has 4 tabs: Today, History, Progress, Settings.

---

## 7. Building order (the 9 prompts)

Build in this order. Each prompt is self-contained. After each, commit to git, then optionally pause/resume in a new Claude Code session.

1. **Project Setup** — Next.js + Tailwind + shadcn/ui + Supabase clients + PWA config
2. **Database + Seed** — schema migration + seed SQL with the locked plan
3. **Layout Shell + Design System** — root layout, bottom nav, reusable components
4. **Home + Week Overview** — today's workout screen + week preview
5. **Active Workout + Set Logging + Rest Timer** — the core of the app
6. **Workout Complete + History** — completion screen + history tab
7. **Progress Charts** — per-exercise progression
8. **Exercise Library + Video Modal** — browse exercises + YouTube embeds
9. **Settings + Polish + PWA + Deploy** — final pass, iPhone optimization, Vercel

Full prompts are in `PROMPTS.md`. Run them ONE AT A TIME.

---

## 8. Resuming sessions (CRITICAL for context limits)

When May returns the next day and starts a new Claude Code session, the FIRST thing he must say is:

> "Read PROJECT_BRIEF.md and CHANGELOG.md, then run `git log --oneline` to see what's been built. Don't write any code yet — just summarize where we are and tell me what the next prompt is."

Once Claude Code confirms it knows where you are, paste the next prompt from `PROMPTS.md`.

This pattern preserves state across sessions even when the conversation history is gone.

---

## 9. Things Claude Code must NOT do

- Do NOT create features beyond what's specified in the current prompt. Stay scoped.
- Do NOT change the workout plan data. It is locked.
- Do NOT change the design tokens or use other colors.
- Do NOT add auth, payment, social, or sharing features for MVP.
- Do NOT use any color that isn't in the design tokens.
- Do NOT add headers, footers, or branding the user didn't ask for.
- Do NOT install extra packages without asking.
- Do NOT skip the commit step at the end of each prompt.
- Do NOT push to GitHub without being asked — only commit locally unless instructed otherwise.

---

## 10. Things Claude Code MUST do

- Always read this file at the start of every new session.
- Always run `git log --oneline` to see progress before suggesting next steps.
- Always commit with a clear message at the end of each prompt.
- Always test the work (visually inspect or via `npm run dev`) before saying "done".
- Always update CHANGELOG.md after each successful prompt with what was added.
- Always preserve the design system colors and component patterns.
- Always use TypeScript strictly — no `any` types unless absolutely necessary.
- Always default to server components in Next.js App Router; only use client components when needed (interactivity, hooks, browser APIs).
- Always handle the empty state and loading state for any data-fetching UI.

---

## 11. Owner notes

- **May** is the project owner. Master's in Data Science at RMIT, .NET dev background, has shipped Code Humanizer (SaaS).
- Comfortable with React, Tailwind, Next.js, TypeScript. Treat as intermediate-to-advanced dev.
- Working on Windows. No Mac.
- Wants candid, direct feedback. No fluff. No over-explaining.
- App is for him + a few friends with iPhones. PWA distribution via "Add to Home Screen".

---

**End of brief. Now read CHANGELOG.md and check `git log --oneline` before doing anything else.**
