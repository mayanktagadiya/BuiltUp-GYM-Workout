# Deploying BuiltUp

Step-by-step guide from zero to live on your iPhone.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in (or create a free account).
2. Click **New project**, give it a name (e.g. `buildup`), choose a region close to you, set a strong database password.
3. Wait ~2 minutes for the project to provision.
4. Go to **Project Settings → API**.
   - Copy the **Project URL** (looks like `https://xxxx.supabase.co`)
   - Copy the **anon / public** key (long JWT string)
5. Go to **SQL Editor** (left sidebar).
6. Click **New query**, paste the contents of `supabase/migrations/001_initial_schema.sql`, click **Run**.
7. Click **New query** again, paste the contents of `supabase/seed.sql`, click **Run**.
8. Verify: run `select count(*) from exercises;` — should return 44.

---

## 2. Push to GitHub

If you haven't already:

```bash
git remote add origin https://github.com/YOUR_USERNAME/buildup.git
git push -u origin master
```

Or follow `GITHUB_SETUP.md` if it exists.

---

## 3. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. Click **Import** next to your `buildup` GitHub repo.
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` → paste your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → paste your Supabase anon key
4. Leave all other settings at default (Next.js is auto-detected).
5. Click **Deploy**.
6. Wait ~2 minutes for the build to complete.
7. Vercel gives you a URL like `https://buildup-xyz.vercel.app` — open it in a browser and confirm the app loads.

---

## 4. Test on iPhone (Safari)

1. Open the Vercel URL in **iPhone Safari**.
2. Confirm the dark theme loads instantly.
3. Tap **Today** — you should see today's workout.
4. Tap **Start workout** → log one set → complete it.
5. Check the **History** tab — the session should appear.
6. Go to Supabase → **Table Editor → set_logs** → confirm the row is there.

---

## 5. Install as PWA on iPhone

1. In Safari, tap the **Share** button (box with arrow).
2. Scroll down and tap **Add to Home Screen**.
3. Name it **BuiltUp** (should be pre-filled).
4. Tap **Add**.
5. Find the BuiltUp icon on your home screen. Tap to open.
6. The app should open fullscreen with no Safari chrome — that's the PWA working.

First launch from home screen may take 2–3 seconds while the service worker installs. Every launch after that is instant.

---

## 6. Share with friends

1. Send them your `.vercel.app` URL (or custom domain if you set one).
2. Tell them:
   > "Open in Safari on your iPhone. Tap Share → Add to Home Screen → Add. It'll be on your home screen like an app."
3. First open is slow (~3s). After that it's instant and works offline.

---

## 7. (Optional) Custom domain

1. In Vercel project settings → **Domains**.
2. Add your domain (e.g. `buildup.yourdomain.com`).
3. Update your DNS to point at Vercel (instructions shown in the Vercel UI).
4. Vercel auto-issues an SSL certificate. Takes ~10 minutes to propagate.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Blank screen / can't connect | Check env vars are set correctly in Vercel |
| "No workouts" on Today | Run the seed SQL in Supabase SQL Editor |
| Data not saving | Check browser console for Supabase errors; confirm anon key is correct |
| PWA not installable | Must be on HTTPS (Vercel is always HTTPS) and opened in Safari on iPhone |
| Service worker not updating | Hard-refresh in Safari: hold Share → Reload |
