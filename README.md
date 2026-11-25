# Qamar Abbas — portfolio

Next.js 16 · React 19 · Tailwind CSS 4 · three.js · Supabase (database, login, photo storage).
All styling is Tailwind utilities; `src/app/globals.css` only holds the theme tokens.

The artist changes everything himself in the **admin panel** at `/admin` (works, series, words, pictures, journal, enquiries).
The public site reads that content from the database, caches it, and is refreshed the moment he saves.

```powershell
npm install --ignore-scripts
copy .env.example .env.local     # then fill in the two Supabase values
npm run dev                      # http://localhost:3210
npm run build ; npm start        # production build, as Vercel runs it
npm test                         # validation and helper tests
npm run typecheck
```

## How it fits together

| Part | Where |
|---|---|
| Database tables, row level security, storage, contact-form function | `supabase/schema.sql` |
| The content as rows (made from `src/data/*.ts`) | `supabase/seed.sql` |
| A test that tries visitor / user / admin against every table | `supabase/tests/rls.sql` |
| What the public site reads (cached, refreshed on save, falls back to the bundled copy) | `src/lib/content/` |
| The bundled copy: seed source and the fallback if the database cannot be reached | `src/data/*.ts` |
| Admin: pages, forms, server actions | `src/app/admin/`, `src/components/admin/` |
| Admin login check (session + `is_admin()`), used by every page and action | `src/lib/admin/auth.ts`, `src/proxy.ts` |
| Upload pipeline (shrinks photographs in the browser, sends them straight to storage) | `src/lib/admin/imageTools.ts`, `src/components/admin/ImageUpload.tsx` |
| Contact form → database (limits enforced inside the database) | `src/app/api/enquiry/route.ts`, `submit_enquiry()` in `schema.sql` |
| Daily keep-alive so a free Supabase project is not paused | `vercel.json` → `src/app/api/keepalive/route.ts` |
| 3D bark sheet in the hero, true-size wall | `src/components/BarkCanvas.tsx`, `Wall.tsx`, `ScaleWall.tsx` |
| Where each piece of content came from | `CONTENT-SOURCES.md` |

## Setting up a fresh Supabase project

1. Create a project. Under *Authentication → Sign In / Providers* turn **off** "Allow new users to sign up" (only the admin logs in), set the minimum password length to 12 and turn off magic links.
2. SQL editor: run `supabase/schema.sql`, then `supabase/seed.sql`, then `supabase/tests/rls.sql` (the result must match the comments in that file).
3. *Authentication → Users → Add user → Create new user* (tick Auto Confirm). Then, in the SQL editor, make that user an admin:
   `insert into public.admins (user_id) select id from auth.users where email = 'the-admin@example.com';`
4. Copy the project URL and the **publishable** key (*Project Settings → API Keys*) into `.env.local` and into Vercel's Environment Variables.
   No secret / service-role key is used anywhere: every write is made as the logged-in admin and checked by the database.

## Photographs

Works: the admin uploads one photograph; the browser makes three WebP sizes (1600, 1000 and 480 px) and a tiny blurred placeholder, and uploads
them to the public `media` bucket under a unique name (cached for a year). Grids use the medium size, small lists the small one, and the viewer the full one.
The first 39 works ship with the site in `public/works/` (`NN.webp`, `md/NN.webp`, `thumb/NN.webp`).
Hero sheet and portrait: cropped in the browser to the proportions of the place they are shown.

## Contact form

Messages are stored in the `enquiries` table and read in the admin panel (*Enquiries*). The database refuses more than 3 messages an hour from one
address and 40 an hour in all, even if the API is called directly. If `ENQUIRY_WEBHOOK_URL` is set (Slack, Zapier, Make…), each message is also forwarded there.
If the message cannot be stored, the visitor's mail app opens with it ready, so nothing is lost.

Set `NEXT_PUBLIC_SITE_URL` to the real domain before launch (sitemap, robots, social cards).
Set `CRON_SECRET` (any long random string) in Vercel so only Vercel Cron can call `/api/keepalive`.
