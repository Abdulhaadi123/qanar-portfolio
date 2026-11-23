/** The three essays from the Lovable draft, unchanged. */
export interface Post {
  slug: string;
  title: string;
  category: string;
  date: string; // ISO
  read: string;
  dek: string;
  body: { h?: string; p?: string; quote?: string }[];
}

export const posts: Post[] = [
  {
    slug: "sadequain-calligraphy-as-painting",
    title: "Sadequain: When Calligraphy Became Painting",
    category: "Artists",
    date: "2026-10-12",
    read: "1 min read",
    dek: "How a painter from Amroha turned the written word into monumental modern art, and why his work still matters for Pakistani artists.",
    body: [
      {
        p: "Syed Sadequain Ahmed Naqvi (1930–1987) is often remembered as the artist who brought calligraphy out of the manuscript and onto the wall. Born in Amroha and later based in Karachi, he worked across painting, murals and poetry.",
      },
      { h: "From figure to letter" },
      {
        p: "In his early career Sadequain was known for expressive figurative work. Over time the letter took over: Quranic verses and poetry became the structure of his compositions, with strokes that behaved like both script and drawing.",
      },
      { quote: "He treated the letter not as decoration but as a living form." },
      { h: "Why he matters today" },
      {
        p: "His murals, including the celebrated ceiling at Frere Hall in Karachi, showed that calligraphy could hold its own at the scale of public art. For artists working today, he remains proof that tradition and modernity are not opposites.",
      },
    ],
  },
  {
    slug: "nastaliq-the-hanging-script",
    title: "Nastaliq: The Hanging Script",
    category: "Art styles",
    date: "2026-09-02",
    read: "1 min read",
    dek: "A short history of the script that carries Urdu and Persian poetry — its origins, its rhythm, and what makes it so hard to master.",
    body: [
      {
        p: "Nastaliq emerged in Iran in the fourteenth and fifteenth centuries and is traditionally associated with the calligrapher Mir Ali Tabrizi. Its name is often explained as a blend of Naskh and Taliq.",
      },
      { h: "A script that slopes" },
      {
        p: "Unlike scripts that sit on a flat baseline, Nastaliq words descend diagonally from right to left. This gives lines of poetry their characteristic hanging, flowing quality.",
      },
      { h: "Nastaliq in the subcontinent" },
      {
        p: "Under the Mughals the script flourished, and it became the standard hand for Urdu. Even in the age of digital type, the craft of hand-written Nastaliq is still studied and treasured in Pakistan.",
      },
    ],
  },
  {
    slug: "ibn-muqla-proportioned-script",
    title: "Ibn Muqla and the Science of Proportion",
    category: "Artists",
    date: "2026-07-18",
    read: "1 min read",
    dek: "The tenth-century vizier who gave Arabic calligraphy its rules — the alif, the rhombic dot, and a system still taught today.",
    body: [
      {
        p: "Abu Ali Muhammad ibn Muqla (c. 885–940) served as a vizier in Abbasid Baghdad. His lasting legacy, however, is a method: al-khatt al-mansub, the proportioned script.",
      },
      { h: "Measuring with the pen" },
      {
        p: "Ibn Muqla used the rhombic dot made by the reed pen as a unit of measure. The height of the alif was set in dots, and every other letter was sized in relation to it.",
      },
      { quote: "Proportion turned beautiful writing into a teachable discipline." },
      {
        p: "This system is the reason a student today can learn Naskh or Thuluth step by step. In my own classes, the dot and the alif are still the first lesson.",
      },
    ],
  },
];

export const postBySlug = (slug: string) => posts.find((p) => p.slug === slug);

export const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
