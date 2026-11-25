/**
 * Everything here comes from Qamar Abbas's own sources: his Wix portfolio site, his Lovable
 * draft site and, above all, his portfolio PDF. Nothing is invented. See CONTENT-SOURCES.md.
 * Edit this file to change the words on the site.
 */

export const site = {
  name: "Qamar Abbas",
  nameUrdu: "قمر عباس",
  role: "Visual artist & art educator",
  base: "Lahore, Pakistan",
  origin: "Oshikhandass valley, Gilgit-Baltistan",
  born: "1997",
  /** Wix site contact: used for the enquiry form */
  email: "qartstudio3@gmail.com",
  /** contact written on the first page of the portfolio PDF */
  email2: "abbas.khushall@gmail.com",
  phone: "+92 348 4653180",
  phoneHref: "+923484653180",
  studio: ["Q Art studio", "E-130-A2, Gilani Street", "Nadirbad"],
  studio2: ["Anokha studio", "Punjab Small Industries", "Lahore"],
  socials: [
    { label: "Instagram", handle: "@qamarabbas_artist", href: "https://www.instagram.com/qamarabbas_artist" },
    { label: "Facebook", handle: "Qamar Abbas", href: "https://www.facebook.com/share/1BaZumZigu/" },
    { label: "X", handle: "@KhushallArt", href: "https://x.com/KhushallArt" },
    { label: "LinkedIn", handle: "Qamar Abbas", href: "https://www.linkedin.com/in/abbas-qamar-36126120b" },
  ],
  /**
   * The studio portrait from the Wix site. Tried in order:
   * 1. /media/portrait.jpg  (replace with the original photograph for the best quality)
   * 2. the image served by the artist's Wix site
   */
  portrait: [
    "/media/portrait.jpg",
    "https://static.wixstatic.com/media/4e6f30_74c621e5b3754da7958e2689fdcbc03c~mv2.webp/v1/fill/w_1000,h_1000,al_c,q_85/qamar-abbas.webp",
  ],
  /** His portfolio PDF ("For Portfolio click here" on the Wix site). */
  portfolioPdf: "https://3b787863-b885-47e2-9503-0d9532eb5825.filesusr.com/ugd/4e6f30_6491b999d50e4fc2a0f626c433eda06c.pdf",
};

/** first page of the portfolio PDF, first person */
export const bio =
  "My name is Qamar Abbas, a Visual Artist born in 1997 in the Oshikhandass valley of Gilgit Baltistan. I graduated from the National College of Arts (NCA), Lahore, in 2020 with a degree in Fine Arts, specializing in painting.";

/** first page of the portfolio PDF, continued */
export const career = [
  "My artistic journey reached a significant peak in 2025, where I participated in the Portrait of Quaid-e-Azam competition and group exhibition at Alhamra Art Council, the “Eid al-Etihad” group exhibition for the UAE National Day at Sambara Art Gallery, Karachi, and the Anamolka Award Exhibition at Punjab University Gallery. These followed a productive 2024, during which I showcased my work at the Artiade – Olympic of Art in New York and the “LIMINAL” group show at Haam Gallery, Lahore.",
  "Earlier in my career, I was honored to win the Asia Pacific Regional Art Contest (Ozone2climate Change) in 2022 and was recognized as a top 10 winner at the 16th Young Artist Exhibition at Alhamra Art Council in 2019. My exhibition history also includes the Young Artists Exhibitions at the Hyderabad Arts Council in 2016 and the Karachi Arts Council in 2014. Beyond my studio practice, I am deeply committed to art education; during the COVID-19 pandemic, I organized workshops in my hometown schools to inspire young minds through visual expression.",
];

/** the general artist statement from his Wix site */
export const statement = [
  "Paper Birch (Bhojpatra) bark serves as my preferred work surface, which I incorporate into my ongoing “Echoes on Birch” series. Within this medium, I employ traditional scripts and calligraphic mark-making — particularly Khat-e-Suls — as vital visual elements to explore complex themes of landscape and cultural memory.",
  "In parallel, my practice delves into conceptual investigations that subvert constitutional texts and currency-based imagery to critique systemic structures, hierarchies, and the visual representation of power.",
];

/** Wix site: Artist Statement, last paragraph (sentence about Hunza and Learning Alliance) */
export const alsoOnWix =
  "I completed an art residency in Hunza, and I have contributed to art education as an art educator at Learning Alliance, Lahore.";

/** Years come from the portfolio PDF; undated lines come from the Wix site. */
export const record = [
  { year: "1997", what: "Born in the Oshikhandass valley", where: "Gilgit-Baltistan" },
  { year: "2014", what: "Young Artists Exhibition", where: "Karachi Arts Council" },
  { year: "2016", what: "Young Artists Exhibition", where: "Hyderabad Arts Council" },
  { year: "2019", what: "Top 10 winner, 16th Young Artist Exhibition", where: "Alhamra Art Council, Lahore" },
  { year: "2020", what: "Degree in Fine Arts, painting", where: "National College of Arts (NCA), Lahore" },
  { year: "2020", what: "Series 4, embroidery, made in the lockdown; school workshops in his hometown", where: "Gilgit-Baltistan" },
  { year: "2022", what: "Winner, Asia Pacific Regional Art Contest (Ozone2climate Change)", where: "Asia Pacific" },
  { year: "2024", what: "Artiade – Olympic of Art", where: "New York" },
  { year: "2024", what: "“LIMINAL” group show", where: "Haam Gallery, Lahore" },
  { year: "2025", what: "Portrait of Quaid-e-Azam competition and group exhibition", where: "Alhamra Art Council, Lahore" },
  { year: "2025", what: "“Eid al-Etihad” group exhibition for the UAE National Day", where: "Sambara Art Gallery, Karachi" },
  { year: "2025", what: "Anamolka Award Exhibition", where: "Punjab University Gallery, Lahore" },
  { year: "—", what: "Art residency", where: "Hunza" },
  { year: "—", what: "Art educator", where: "Learning Alliance, Lahore" },
];

export const teaching = {
  intro:
    "Teaching is part of my practice. During the COVID-19 pandemic I organized workshops in my hometown schools to inspire young minds through visual expression, and I have served as an art educator at Learning Alliance, Lahore.",
  principles: [
    { no: "01", title: "Line first", text: "Every lesson begins with control of the line — the root of drawing and of writing." },
    { no: "02", title: "Know the masters", text: "Students study the artists and traditions behind each style before making their own." },
    { no: "03", title: "Patience as practice", text: "Repetition is not boring; it is how the hand learns what the eye already sees." },
  ],
};

export const commissionSteps = [
  { no: "01", title: "Share your idea", text: "The text or verse, the script you love, size, colours and where it will hang." },
  { no: "02", title: "Proposal & sketch", text: "I reply by email with a price, timeline and a first composition sketch." },
  { no: "03", title: "Creation", text: "The piece is written and finished by hand in the studio, with progress updates." },
  { no: "04", title: "Delivery", text: "Carefully packed and shipped within Pakistan or internationally." },
];

export const enquiryKinds = ["Buy an artwork", "Commission a piece", "Talk, class or collaboration", "Something else"];

/**
 * What the 3D sheet in the hero carries:
 *  "real"  – the photograph at public/media/hero-bark.webp (a birch-bark work with mountains and ibex)
 *  "drawn" – bark painted in the browser, his name written on in ink, then a red seal pressed
 */
export const heroSurface: "drawn" | "real" = "real";

/** Caption shown beside the sheet while it is open. Null = none (the title and size of this photograph are not known). */
export const heroCaption: { no: string; title: string; medium: string; size: string } | null = null;
