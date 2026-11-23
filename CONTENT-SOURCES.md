# Where every piece of content came from

Two source sites were read in full (2026-11-23):

- **WIX** = https://abbaskhushall.wixsite.com/visual-artist-portfo (home, About, Portfolio Page, Blog, profile pages)
- **LOVABLE** = https://qamarabbasartistportfolio.lovable.app/ (home, works, commissions, teaching, journal + 3 articles, about, contact)

## Taken from the sources

| On this site | Source | Notes |
|---|---|---|
| Biography paragraph | WIX home, "Biography" | verbatim |
| Artist statement (2 paragraphs) | WIX home, "Artist Statement" | verbatim |
| Recognition paragraph (New York Olympic of Art 2024, Hunza residency, Learning Alliance) | WIX home, "Artist Statement" | verbatim; "Checking in Hunza" read as "residency in Hunza" |
| Series 4 embroidery statement | WIX home, "Series 4 Artist Statement" | verbatim |
| The 17 works: titles, sizes, media | WIX home gallery captions | verbatim. "Gallery Price" is blank on every work, so the site says "On request" |
| Studio address, email `qartstudio3@gmail.com` | WIX footer | "Nadirbad" kept as written |
| Instagram, Facebook, X, LinkedIn links | WIX footer icons | LinkedIn tracking parameters removed |
| "Portfolio PDF" button | WIX "For Portfolio click here" | link only, the PDF was not downloaded or read |
| Studio portrait photo | WIX home (hero image, file `4e6f30_74c621e5…~mv2.webp`) | saved as `public/media/portrait.jpg` (1000 × 1250); the Wix host is blocked on this laptop, so it was fetched through a public image proxy and checked by eye |
| Calligraphic mark "قمر" idea | WIX logo image | the site draws the name in Aref Ruqaa; the original logo file was not copied |
| Commission steps (Share your idea, Proposal & sketch, Creation, Delivery) | LOVABLE /commissions | verbatim |
| Teaching principles (Line first, Know the masters, Patience as practice) | LOVABLE /teaching | verbatim |
| Contact wording "To buy a work, commission a piece, or invite me for a talk or class…" and the enquiry types | LOVABLE /contact | verbatim |
| Three journal articles (Sadequain, Nastaliq, Ibn Muqla) incl. dates | LOVABLE /blog | verbatim |
| Footer line "All artworks reproduced with permission of the artist." | LOVABLE footer | verbatim |

## Made for this site (not from either source)

- Design, layout, colours, typography, motion and the 3D birch-bark sheet.
- **The plates (pictures of the 17 works and the series).** Neither source has a photograph, so each plate is drawn by `src/lib/plates.ts` from what the sources do say: the medium (birch bark, marker on paper, watercolour), the size, and the artist statement. Marks are made with a simulated reed pen (the tool of Khat-e-Suls), so **no letters or words are invented**. The only text on any plate is a phrase from his statement ("subvert constitutional texts and currency-based imagery…") set as micro-text on the Constitution & Currency plate. They are illustrations, not his works. The rendered files are `public/works/*.webp`; overwriting one with a real photograph replaces it everywhere.
- The red seal on the bark (a design device; it carries his name قمر عباس).
- Section titles such as "Three ways of making", "Selected works", "Three ways of making", "Record".
- The **true-scale wall**: it only draws the real sizes from the Wix captions.
- "Constitution & Currency" and "Needle & Thread" are the names this site gives to two threads of his statement (conceptual work on constitutional texts and currency imagery; the Series 4 embroidery). Neither name is on his sites.
- The Urdu spelling of his name, قمر عباس (the Wix logo carries "قمر").

## Deliberately NOT used

- **Wix testimonials** (Julian Thorne, Elena Rossi, Marcus Chen): template text, not real.
- **Wix "Portfolio Page", "About - Profile Page", "About the Studio"**: unedited Wix template text ("Modern Interiors", "Seasonal Lookbook", "Certification Name"…).
- **Lovable work list** (Bismillah, Noor, Ishq, Circle of Names, The Reed Speaks, Alif): "IMAGE COMING SOON" placeholders that do not match the Wix works; no photographs.
- **Lovable teaching jobs with dates** (Secondary school 2018–Present, Workshop Leader 2016–Present, Visiting Instructor 2020–2022): they contradict the Wix biography (BFA finished in 2020), so they look like placeholder text.
- **Lovable address `hello@qamarabbas.art`**: the domain is not confirmed; the Wix email is used.
- **Invented Urdu words**: an earlier draft wrote words such as گونج on the bark; they were removed because they were not on his sites.

## Still missing from both sources

- Photographs of the 17 works and of the embroidery (neither site has any).
- Titles (all 17 are "Untitled"), prices, years of the works, and years for the Learning Alliance and Hunza entries.
