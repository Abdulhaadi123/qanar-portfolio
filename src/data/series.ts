import type { SeriesId } from "./works";

/**
 * The four series in the artist's portfolio PDF, with his statements word for word.
 * "Echoes on Birch" is the name he gives his birch-bark series on his Wix site.
 * The names of series 2, 3 and 4 are labels used on this site: the PDF only numbers them.
 */
export interface Series {
  id: SeriesId;
  no: string;
  slug: string;
  title: string;
  kind: string;
  medium: string;
  statement: string[];
  /** work number used as the series' cover picture */
  cover: string;
}

export const series: Series[] = [
  {
    id: "s1",
    no: "01",
    slug: "echoes-on-birch",
    title: "Echoes on Birch",
    kind: "Series 1",
    medium: "Paper birch, ink and gum arabic",
    cover: "06",
    statement: [
      "My work is a profound Connection—with the landscapes of Gilgit-Baltistan that have shaped my identity. I use the rare and delicate bark of the birch trees from these mountains as my canvas, a medium that carries the whispers of the land itself. This material is not just a surface; it is a direct link to the mountains and the stories they hold.",
      "My art is a journey into the heart of these landscapes. Through my mark-making and calligraphy, I express the communication I've experienced with the mountains, a dialogue rooted in my childhood. I explore the traditions, myths, and personal stories that I have absorbed over a lifetime, turning these memories into a visual language.",
      "The act of writing on this natural, living canvas becomes a spiritual process. The textures of the birch bark guide my hand, allowing my calligraphy to emerge as an echo of the mountains. Some marks are clear, while others blend into the natural patterns of the bark, creating a seamless fusion of human expression and the spirit of nature. My work invites the viewer to listen to this silent conversation, to feel the connection between the artist, the mountains, and the stories that bind us. It is a dialogue that transcends words, expressed through the very soul of the land.",
    ],
  },
  {
    id: "s2",
    no: "02",
    slug: "constitution-and-currency",
    title: "Constitution & Currency",
    kind: "Series 2",
    medium: "Digital images, prints, paper and installation",
    cover: "22",
    statement: [
      "My work often addresses complex social and political issues that concern me deeply. I strive to express my thoughts on authority and power structures that are frequently overlooked. I believe that art can serve as a powerful tool for public dialogue, transforming private discussions into public conversations. My keen observations and intellectual approach drive me to challenge the settled socio-political systems of our time.",
      "The body of work I produce, along with the stories I gather from my surroundings, reveals profound insights about our shared reality. On one hand, these elements contribute to the construction of our nation; on the other, they subvert and challenge it. My art encourages viewers to engage with the political landscape while delving into the politics of everyday life—issues that often go unnoticed despite their pervasive presence. Though we may not respond to these subtle dynamics in overt ways, we inevitably become part of these structures over time.",
    ],
  },
  {
    id: "s3",
    no: "03",
    slug: "mountain-portraits",
    title: "Mountain Portraits",
    kind: "Series 3",
    medium: "Charcoal powder drawings",
    cover: "31",
    statement: [
      "My artwork is a tribute to the resilient spirit and historical lifestyle of Gilgit-Baltistan, capturing the deep connection between its people and the rugged landscape they call home. Through detailed charcoal powder drawings, I portray the daily struggles and quiet dignity of the mountain dwellers, from the heavy labor of gathering wood to the spiritual bond shared with the majestic Markhor. By focusing on traditional attire and the weathered faces of the locals, I aim to document a way of life defined by endurance and heritage. My goal is to transform these personal observations into a visual language that honors the strength of my community and keeps the stories of these high-altitude traditions alive for the world to see.",
    ],
  },
  {
    id: "s4",
    no: "04",
    slug: "needle-and-thread",
    title: "Needle & Thread",
    kind: "Series 4 · 2020",
    medium: "Embroidery and oil on canvas",
    cover: "38",
    statement: [
      "During the 2020 lockdown, I turned to the traditional embroidery techniques practiced in my home to express my cultural roots. In this series, I used the needle and thread not just as a craft, but as a way to “paint” the rich history and soul of Gilgit. My work captures the daily life of mountain people, the ancient tradition of Ibex hunting, and the deep historical background of my region. By reimagining these old methods in a new artistic way, I wanted to show how our heritage stays alive even in modern times.",
    ],
  },
];

export const seriesById = (id: SeriesId) => series.find((s) => s.id === id)!;
