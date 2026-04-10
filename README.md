# Togetall

## Deploy on Vercel

1. **Root Directory:** leave **empty** (repository root — do **not** set `web` when using the root `vercel.json`).
2. **Build & Deployment:** clear **Install Command** and **Build Command** in the dashboard (use the repo `vercel.json` instead). If you set overrides here, they replace `vercel.json` and can break the build.
3. Env vars: see `web/.env.example` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, etc.).

The root `package.json` lists `next` so Vercel detects Next.js; `vercel.json` installs both root stubs and `web/` dependencies, then runs `npm run build --prefix web`.

**Local:** from repo root: `npm install && npm install --prefix web`, then `npm run dev` / `npm run build`.
