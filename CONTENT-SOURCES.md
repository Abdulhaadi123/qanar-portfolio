# Where every piece of content came from

Three sources, all the artist's own:

- **PDF** = his portfolio PDF, "For Portfolio click here" on the Wix site (38 pages, created in PowerPoint, 2026)
  https://3b787863-b885-47e2-9503-0d9532eb5825.filesusr.com/ugd/4e6f30_6491b999d50e4fc2a0f626c433eda06c.pdf
- **WIX** = https://abbaskhushall.wixsite.com/visual-artist-portfo
- **LOVABLE** = https://qamarabbasartistportfolio.lovable.app/

## From the PDF (the main source)

| On this site | PDF page |
|---|---|
| All 39 photographs of works (`public/works/NN.webp`), with their titles, sizes and media | pages 3–19, 21–26, 28–32, 34–37 |
| Series 1 statement (birch bark), word for word | 2 |
| Series 2 statement (authority and power structures), word for word | 20 |
| Series 3 statement (charcoal, mountain dwellers, Markhor), word for word | 27 |
| Series 4 statement (embroidery, 2020 lockdown), word for word (the same text is on Wix) | 33 |
| Biography: born 1997, Oshikhandass valley, NCA Lahore 2020, Fine Arts, painting | 1 |
| Exhibitions and awards (2014 Karachi, 2016 Hyderabad, 2019 Alhamra top 10, 2022 Asia Pacific contest winner, 2024 Artiade New York and LIMINAL at Haam Gallery, 2025 Quaid-e-Azam portrait competition, Eid al-Etihad at Sambara Gallery, Anamolka Award) | 1 |
| School workshops in his hometown during COVID-19 | 1 |
| Second contact: `abbas.khushall@gmail.com`, +92 348 4653180, "anokha studio punjab small industries lahore" | 1 |
| "Gallery Price :" is blank on every work, so the site says "On request"; "Not available" on Color Pallette and Law For Sale | 3–37 |

How the photographs were prepared: each image was taken out of the PDF at its original resolution; the page-size images that also carried
a caption were cropped to the artwork; all were converted to WebP (long side at most 1500 px). Nothing was retouched.

## From the Wix site

| On this site | Where |
|---|---|
| General artist statement ("Paper Birch (Bhojpatra) bark…", "In parallel, my practice…"), the name "Echoes on Birch", Khat-e-Suls | home, Artist Statement |
| Art residency in Hunza; art educator at Learning Alliance, Lahore | home, Artist Statement |
| Studio address (Q Art studio, E-130-A2, Gilani Street, "Nadirbad") and `qartstudio3@gmail.com` | footer |
| Instagram, Facebook, X, LinkedIn links | footer icons |
| Studio portrait photograph | home hero image; saved as `public/media/portrait.jpg` (the Wix image host is blocked on the build laptop, so it was fetched through a public image proxy and checked by eye) |

## From the Lovable site

Commission steps, the three teaching principles (Line first, Know the masters, Patience as practice), the contact wording and enquiry types,
the three journal articles with their dates, and the footer line "All artworks reproduced with permission of the artist." All word for word.

## Made for this site (not from any source)

- Design, layout, colours, typography, motion, and the 3D birch-bark sheet in the hero. The sheet is a drawn object that evokes his
  surface; it is not one of his works. Its only writing is his name, قمر عباس.
- The **true-size wall**: it draws each work at the size written in the PDF next to a 175 cm figure. Height and width are ordered to
  match each photograph.
- Names for series 2, 3 and 4. The PDF only numbers them; "Constitution & Currency", "Mountain Portraits" and "Needle & Thread" are labels
  taken from what each statement and its works are about. "Echoes on Birch" is the name Wix gives his birch series.
- Section titles, and the share card (`src/app/opengraph-image.jpg`), which uses work no. 06.
- The Urdu spelling of his name, قمر عباس.

## Deliberately NOT used

- Wix testimonials (Julian Thorne, Elena Rossi, Marcus Chen) and the Wix "Portfolio Page" / "About - Profile Page" / "About the Studio":
  unedited Wix template text.
- The Lovable work list (Bismillah, Noor, Ishq…) and its dated teaching jobs: placeholders that match nothing in his own portfolio.
- `hello@qamarabbas.art` (Lovable): not a confirmed address.
- The colour portrait on PDF page 1 and the PDF's second photo of The Constitution (installed on an acrylic shelf): left out; easy to add.

## To confirm with the artist

1. **Two contact sets.** The PDF gives `abbas.khushall@gmail.com`, +92 348 4653180 and "Anokha studio, Punjab Small Industries, Lahore";
   Wix gives `qartstudio3@gmail.com` and "Q Art studio, Gilani Street, Nadirbad". The site shows both; the contact form mails the Wix address.
2. Titles (all but four works are "Untitled"), prices, and the years of the works.
3. Works 11 and 12 have no medium written in the PDF; the site says "Medium not listed".
4. The 2025 exhibitions are listed without months; the Hunza residency and the Learning Alliance post have no years.
