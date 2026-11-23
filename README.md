# Qamar Abbas — portfolio

Next.js 16 · React 19 · Tailwind CSS 4 · three.js. All styling is Tailwind utilities; `src/app/globals.css` only holds the theme tokens.

```powershell
npm install --ignore-scripts
npm run dev      # http://localhost:3210
npm run build
```

## Where things are

| What | File |
|---|---|
| Words (bio, statement, record, teaching, links) | `src/data/site.ts` |
| The 17 works: sizes (cm), media | `src/data/works.ts` |
| Journal articles | `src/data/journal.ts` |
| Where each piece of content came from | `CONTENT-SOURCES.md` |
| 3D birch-bark sheet in the hero | `src/components/BarkCanvas.tsx`, `src/lib/bark.ts` |
| True-scale catalogue wall | `src/components/ScaleWall.tsx` |

## Adding the real photographs

Until then each work is drawn from its own medium and size (`src/lib/plates.ts`). To use a real photograph:
1. Put each file in `public/works/`, for example `public/works/07.jpg`.
2. In `src/data/works.ts` add `photo: "/works/07.jpg"` to that work.
   The gallery, the viewer and the true-size wall switch to the photograph by themselves.

## Portrait

`public/media/portrait.jpg` (from his Wix site). Replace it with the original photograph for the best quality.
If that file is missing the site falls back to the Wix image, then to his name in calligraphy (`src/data/site.ts → portrait`).

## Contact form

`/api/enquiry` forwards the message to `ENQUIRY_WEBHOOK_URL` (Slack, Formspree, Zapier, Make…) when it is set.
Without it, the visitor's mail app opens with the message ready, addressed to the studio email.

Set `NEXT_PUBLIC_SITE_URL` to the real domain before launch (sitemap, robots, social cards).
