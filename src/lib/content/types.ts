/** The shapes the public site works with. They are built from database rows in queries.ts (or from the bundled copy in fallback.ts). */

export type SeriesId = string;
export type Availability = "available" | "sold" | "not_available";

export interface Work {
  id: string;
  no: string;
  title: string;
  /** id of the series it belongs to */
  series: SeriesId;
  /** as written, e.g. "29.5 × 21.5 in" */
  size: string;
  hCm: number | null;
  wCm: number | null;
  medium: string;
  note: string;
  year: number | null;
  /** free text, empty = "On request" */
  price: string;
  availability: Availability;
  /** width / height of the photograph */
  ratio: number;
  /** full size (lightbox) */
  photo: string;
  /** medium size (grids, the 3D wall, the true-size wall) */
  photoMd: string;
  /** small (lists, covers) */
  photoThumb: string;
  /** a tiny blurred copy as a data URL, shown while the photograph loads */
  blur: string;
  /** position on the home page's turning wall, null = not featured */
  featuredPos: number | null;
}

export interface Series {
  id: SeriesId;
  /** 01, 02 ... in display order */
  no: string;
  slug: string;
  title: string;
  /** "Series 1" */
  kind: string;
  medium: string;
  statement: string[];
  /** number of the work shown as the series' cover, null when the series has no works */
  cover: string | null;
}

export interface Social {
  label: string;
  handle: string;
  href: string;
}
export interface TitledText {
  title: string;
  text: string;
}
export interface Highlight {
  k: string;
  v: string;
}

export interface SiteSettings {
  name: string;
  nameUrdu: string;
  role: string;
  base: string;
  origin: string;
  born: string;
  email: string;
  email2: string;
  phone: string;
  phoneHref: string;
  studio: string[];
  studio2: string[];
  socials: Social[];
  portfolioPdf: string;
  bio: string;
  career: string[];
  statement: string[];
  statementNote: string;
  teachingIntro: string;
  teachingPrinciples: TitledText[];
  commissionSteps: TitledText[];
  commissionIntro: string;
  enquiryKinds: string[];
  heroImage: string;
  heroTagline: string;
  heroBlurb: string;
  highlights: Highlight[];
  footerBlurb: string;
  seoDescription: string;
  portraitImage: string;
  portraitBlur: string;
}

export interface PostBlock {
  h?: string;
  p?: string;
  quote?: string;
}
export interface Post {
  id: string;
  slug: string;
  title: string;
  category: string;
  /** ISO date, 2026-10-12 */
  date: string;
  read: string;
  dek: string;
  body: PostBlock[];
}

export interface RecordEntry {
  id: string;
  year: string;
  what: string;
  where: string;
  exhibition: boolean;
}

export interface Content {
  site: SiteSettings;
  series: Series[];
  works: Work[];
  posts: Post[];
  record: RecordEntry[];
}
