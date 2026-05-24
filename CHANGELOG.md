# Changelog

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
