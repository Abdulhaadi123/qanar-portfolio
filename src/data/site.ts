/**
 * Everything here comes from Qamar Abbas's two existing sites
 * (the Wix portfolio and the Lovable draft). Nothing is invented.
 * Edit this file to change the words on the site.
 */

export const site = {
  name: "Qamar Abbas",
  nameUrdu: "قمر عباس",
  role: "Visual artist & art educator",
  base: "Lahore, Pakistan",
  origin: "Oshikhandass valley, Gilgit-Baltistan",
  email: "qartstudio3@gmail.com",
  studio: ["Q Art studio", "E-130-A2, Gilani Street", "Nadirbad"],
  socials: [
    { label: "Instagram", handle: "@qamarabbas_artist", href: "https://www.instagram.com/qamarabbas_artist" },
    { label: "Facebook", handle: "Qamar Abbas", href: "https://www.facebook.com/share/1BaZumZigu/" },
    { label: "X", handle: "@KhushallArt", href: "https://x.com/KhushallArt" },
    { label: "LinkedIn", handle: "Qamar Abbas", href: "https://www.linkedin.com/in/abbas-qamar-36126120b" },
  ],
  /**
   * The studio portrait from the Wix site. The site tries these in order:
   * 1. /media/portrait.jpg  (drop the original photograph here; best quality)
   * 2. the image served by the artist's Wix site
   */
  portrait: [
    "/media/portrait.jpg",
    "https://static.wixstatic.com/media/4e6f30_74c621e5b3754da7958e2689fdcbc03c~mv2.webp/v1/fill/w_1000,h_1000,al_c,q_85/qamar-abbas.webp",
  ],
  /** Public file link from the Wix site ("For Portfolio click here"). */
  portfolioPdf: "https://3b787863-b885-47e2-9503-0d9532eb5825.filesusr.com/ugd/4e6f30_6491b999d50e4fc2a0f626c433eda06c.pdf",
};

export const bio =
  "I am Qamar Abbas, a visual artist and art educator currently based in Lahore, Pakistan. Originally from the Oshikhandass valley in the Gilgit-Baltistan region, I completed my BFA in Painting from the National College of Arts (NCA), Lahore in 2020. My academic and professional journey reflects a deep engagement with both regional heritage and contemporary conceptual practices.";

export const statement = [
  "Paper Birch (Bhojpatra) bark serves as my preferred work surface, which I incorporate into my ongoing “Echoes on Birch” series. Within this medium, I employ traditional scripts and calligraphic mark-making — particularly Khat-e-Suls — as vital visual elements to explore complex themes of landscape and cultural memory.",
  "In parallel, my practice delves into conceptual investigations that subvert constitutional texts and currency-based imagery to critique systemic structures, hierarchies, and the visual representation of power.",
];

export const recognition =
  "As an active voice in the contemporary art community, I participated in the Artiade Organization New York Olympic of Art in 2024 and completed an art residency in Hunza. Alongside my studio practice, I have contributed significantly to art education, having served as an art educator at Learning Alliance, Lahore.";

export const series = [
  {
    no: "01",
    slug: "echoes-on-birch",
    title: "Echoes on Birch",
    kind: "Ongoing series",
    medium: "Paper birch (Bhojpatra) and archival ink marker",
    text: "Khat-e-Suls and other traditional scripts written on birch bark, carrying landscape and cultural memory.",
  },
  {
    no: "02",
    slug: "constitution-and-currency",
    title: "Constitution & Currency",
    kind: "Conceptual practice",
    medium: "Conceptual investigations",
    text: "Constitutional texts and currency-based imagery turned against themselves, to question structures, hierarchies and the picture of power.",
  },
  {
    no: "03",
    slug: "needle-and-thread",
    title: "Needle & Thread",
    kind: "Series 4 · 2020",
    medium: "Embroidery",
    text: "Made in the 2020 lockdown at home in Gilgit: the daily life of mountain people, the old tradition of ibex hunting, and the deep history of the region.",
  },
];

export const seriesFourStatement =
  "During the 2020 lockdown, I turned to the traditional embroidery techniques practiced in my home to express my cultural roots. In this series, I used the needle and thread not just as a craft, but as a way to “paint” the rich history and soul of Gilgit. My work captures the daily life of mountain people, the ancient tradition of Ibex hunting, and the deep historical background of my region. By reimagining these old methods in a new artistic way, I wanted to show how our heritage stays alive even in modern times.";

/** Dated entries only where the sources give a date. */
export const record = [
  { year: "Origin", what: "Born into the Oshikhandass valley", where: "Gilgit-Baltistan" },
  { year: "2020", what: "BFA in Painting", where: "National College of Arts (NCA), Lahore" },
  { year: "2020", what: "Series 4, embroidery, made during the lockdown", where: "Gilgit" },
  { year: "—", what: "Art educator", where: "Learning Alliance, Lahore" },
  { year: "—", what: "Art residency", where: "Hunza" },
  { year: "2024", what: "Participant, New York Olympic of Art", where: "Artiade Organization, New York" },
  { year: "Now", what: "Echoes on Birch, ongoing", where: "Q Art studio" },
];

export const teaching = {
  intro: "Teaching is part of my practice. I have served as an art educator at Learning Alliance, Lahore.",
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
