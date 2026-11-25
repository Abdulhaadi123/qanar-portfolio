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
| Words (bio, exhibitions, record, teaching, contact) | `src/data/site.ts` |
| The four series and their statements | `src/data/series.ts` |
| The 39 works: titles, sizes, media, photo path | `src/data/works.ts` |
| Photographs of the works | `public/works/NN.webp` |
| Journal articles | `src/data/journal.ts` |
| Where each piece of content came from | `CONTENT-SOURCES.md` |
| 3D birch-bark sheet in the hero | `src/components/BarkCanvas.tsx`, `src/lib/bark.ts` |
| True-size wall | `src/components/Wall.tsx`, `ScaleWall.tsx` |

## Changing or adding a work

Overwrite `public/works/NN.webp` with a better photograph (same name, any size), or edit its line in `src/data/works.ts`
(title, size, medium, `photo`). Set `hCm` and `wCm` to `null` for works with no fixed size; they stay in the gallery but not on the wall.

## Portrait

`public/media/portrait.jpg` (from his Wix site). Replace it with the original photograph for the best quality.
If that file is missing the site falls back to the Wix image, then to his name in calligraphy (`src/data/site.ts → portrait`).
The share card is `src/app/opengraph-image.jpg` (also used for Twitter).

## Hero sheet

The 3D sheet carries `public/media/hero-bark.webp`. Replace it with a better photograph (any size; the sheet follows its proportions,
set `SHEET_W` / `SHEET_L` in `src/lib/bark.ts` to match) and, if the title and size are known, fill `heroCaption` in `src/data/site.ts`.
`heroSurface` there chooses between this photograph ("real") and a painted bark with his name in ink ("drawn").

## Contact form

`/api/enquiry` forwards the message to `ENQUIRY_WEBHOOK_URL` (Slack, Formspree, Zapier, Make…) when it is set.
Without it, the visitor's mail app opens with the message ready, addressed to the studio email.

Set `NEXT_PUBLIC_SITE_URL` to the real domain before launch (sitemap, robots, social cards).
