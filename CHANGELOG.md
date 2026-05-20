# Changelog

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
