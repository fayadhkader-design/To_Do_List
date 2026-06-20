# Carolina Daybook

A responsive UNC–Chapel Hill-inspired to-do list with an integrated monthly calendar.

## Run locally

Install a current Node.js release, then run:

```bash
pnpm install
pnpm dev
```

Open the local URL printed in the terminal.

## Production build

```bash
pnpm build
```

The compiled site is written to `dist/`. Signed-in users' tasks are saved securely in Supabase.

## Supabase setup

1. Copy `.env.example` to `.env.local` and fill in the project URL and publishable key.
2. Open Supabase **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it once.
3. In Supabase **Authentication → URL Configuration**, set the production site URL and add local development as an allowed redirect:
   - Production: `https://to-do-list-tawny-phi-28.vercel.app`
   - Local: `http://127.0.0.1:5173`

Authentication and row-level security ensure each signed-in user can access only their own tasks.
