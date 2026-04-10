# Togetall

## Deploy on Vercel

1. **Project → Settings → Build and Deployment → Root Directory:** set to **`web`** (required). If it stays empty, Vercel only sees the repo root `package.json` layout and may report “No Next.js version detected”.
2. Clear **Install Command** and **Build Command** overrides so defaults run inside `web/` (where `next` is listed in `package.json`).
3. Add env vars from `web/.env.example` (e.g. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

**Local:** from repo root run `npm install && npm install --prefix web`, then use root `npm run dev` / `npm run build`.
