/**
 * The 17 works listed on the Wix portfolio, exactly as written there:
 * title, size and medium. The Wix page has no photographs of them and the
 * "Gallery Price" is blank on every one, so prices show as "On request".
 *
 * Sizes are stored in centimetres so the site can draw each work at true scale.
 * The source writes "29.5X21.5 inch" without saying which number is the height;
 * art convention is height × width, so hCm × wCm follows that order.
 * If one is the wrong way round, swap its hCm and wCm below.
 *
 * To add a photograph: put the file in /public/works and set `photo`,
 * for example  photo: "/works/07.jpg".
 */
import type { PlateStyle } from "@/lib/plates";

export type Group = "birch" | "marker" | "watercolour" | "other";

export interface Work {
  no: string;
  title: string;
  /** as written on the source site */
  size: string;
  hCm: number;
  wCm: number;
  medium: string;
  group: Group;
  photo?: string;
}

export const groups: { id: "all" | Group; label: string }[] = [
  { id: "all", label: "All works" },
  { id: "birch", label: "Echoes on Birch" },
  { id: "marker", label: "Marker on paper" },
  { id: "watercolour", label: "Watercolour" },
  { id: "other", label: "Medium not listed" },
];

const IN = 2.54;
const BIRCH = "Paper birch and archival ink marker";
const PAPER = "Paper & archival ink marker";

export const works: Work[] = [
  { no: "01", title: "Untitled", size: "29.5 × 21.5 in", hCm: 29.5 * IN, wCm: 21.5 * IN, medium: BIRCH, group: "birch" },
  { no: "02", title: "Untitled", size: "29.5 × 21.5 in", hCm: 29.5 * IN, wCm: 21.5 * IN, medium: BIRCH, group: "birch" },
  { no: "03", title: "Untitled", size: "29.5 × 21.5 in", hCm: 29.5 * IN, wCm: 21.5 * IN, medium: BIRCH, group: "birch" },
  { no: "04", title: "Untitled", size: "12 × 12 in", hCm: 12 * IN, wCm: 12 * IN, medium: BIRCH, group: "birch" },
  { no: "05", title: "Untitled", size: "13 × 16 in", hCm: 13 * IN, wCm: 16 * IN, medium: BIRCH, group: "birch" },
  { no: "06", title: "Untitled", size: "11.8 × 8.5 in", hCm: 11.8 * IN, wCm: 8.5 * IN, medium: BIRCH, group: "birch" },
  { no: "07", title: "Untitled", size: "47 × 73 cm", hCm: 47, wCm: 73, medium: "Not listed", group: "other" },
  { no: "08", title: "Untitled", size: "11.8 × 8.5 in", hCm: 11.8 * IN, wCm: 8.5 * IN, medium: BIRCH, group: "birch" },
  { no: "09", title: "Untitled", size: "11.8 × 8.5 in", hCm: 11.8 * IN, wCm: 8.5 * IN, medium: PAPER, group: "marker" },
  { no: "10", title: "Untitled", size: "11.8 × 8.5 in", hCm: 11.8 * IN, wCm: 8.5 * IN, medium: BIRCH, group: "birch" },
  { no: "11", title: "Untitled", size: "11.8 × 8.5 in", hCm: 11.8 * IN, wCm: 8.5 * IN, medium: BIRCH, group: "birch" },
  { no: "12", title: "Untitled", size: "38 × 55 cm", hCm: 38, wCm: 55, medium: BIRCH, group: "birch" },
  { no: "13", title: "Untitled", size: "11.8 × 8.5 in", hCm: 11.8 * IN, wCm: 8.5 * IN, medium: PAPER, group: "marker" },
  { no: "14", title: "Untitled", size: "106 × 76 cm", hCm: 106, wCm: 76, medium: "Not listed", group: "other" },
  { no: "15", title: "Untitled", size: "11.8 × 8.5 in", hCm: 11.8 * IN, wCm: 8.5 * IN, medium: BIRCH, group: "birch" },
  { no: "16", title: "Untitled", size: "11.8 × 8.5 in", hCm: 11.8 * IN, wCm: 8.5 * IN, medium: PAPER, group: "marker" },
  { no: "17", title: "Untitled", size: "12 × 17 in", hCm: 12 * IN, wCm: 17 * IN, medium: "Watercolour on paper", group: "watercolour" },
];

export const worksByNo = (no: string) => works.find((w) => w.no === no);

/**
 * Until a photograph exists, each work is drawn from its own medium (see src/lib/plates.ts):
 * birch bark, marker on paper, watercolour, or (medium not listed) the constitution & currency thread.
 */
export const styleOf = (w: Work): PlateStyle =>
  w.group === "birch" ? "birch" : w.group === "marker" ? "marker" : w.group === "watercolour" ? "watercolour" : "currency";
export const seedOf = (w: Work) => parseInt(w.no, 10) * 37 + 11;
export const ratioOf = (w: Work) => w.wCm / w.hCm;

/** the six shown on the home page */
export const selected = ["01", "17", "05", "09", "12", "14"].map((n) => worksByNo(n)!);

export const cm = (n: number) => `${Math.round(n * 10) / 10} cm`;
