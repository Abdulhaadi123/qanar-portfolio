/**
 * The 39 works in Qamar Abbas's own portfolio PDF ("For Portfolio click here" on his Wix site),
 * with the titles, sizes and media written under each photograph there.
 * The photographs are the PDF's own, converted to WebP (public/works/NN.webp).
 *
 *  - "Gallery price" is blank for every work in the PDF, so the site says "On request".
 *  - hCm / wCm are the written size in centimetres, with height and width ordered to match the photograph.
 *    They are null where the PDF gives no fixed size ("Variable") or one size for a set ("5 x 6 in each").
 *  - medium is "" where the PDF lists none.
 */
export type SeriesId = "s1" | "s2" | "s3" | "s4";

export interface Work {
  no: string;
  title: string;
  series: SeriesId;
  /** as written in the PDF */
  size: string;
  hCm: number | null;
  wCm: number | null;
  medium: string;
  note: string;
  /** width / height of the photograph */
  ratio: number;
  photo: string;
}

export const works: Work[] = [
  { no: "01", title: "Untitled", series: "s1", size: "29.5 × 21.5 in", hCm: 74.9, wCm: 54.6, medium: "Paper birch and archival ink marker", note: "", ratio: 0.7485, photo: "/works/01.webp" },
  { no: "02", title: "Untitled", series: "s1", size: "29.5 × 21.5 in", hCm: 74.9, wCm: 54.6, medium: "Paper birch and archival ink marker", note: "", ratio: 0.7453, photo: "/works/02.webp" },
  { no: "03", title: "Untitled", series: "s1", size: "29.5 × 21.5 in", hCm: 74.9, wCm: 54.6, medium: "Paper birch and archival ink marker", note: "", ratio: 0.7544, photo: "/works/03.webp" },
  { no: "04", title: "Untitled", series: "s1", size: "12 × 12 in", hCm: 30.5, wCm: 30.5, medium: "Paper birch and archival ink marker", note: "", ratio: 1.0, photo: "/works/04.webp" },
  { no: "05", title: "Untitled", series: "s1", size: "14 × 7 in", hCm: 17.8, wCm: 35.6, medium: "Paper birch and archival ink marker", note: "", ratio: 1.8486, photo: "/works/05.webp" },
  { no: "06", title: "Untitled", series: "s1", size: "13 × 16 in", hCm: 40.6, wCm: 33.0, medium: "Paper birch and archival ink marker", note: "", ratio: 0.8197, photo: "/works/06.webp" },
  { no: "07", title: "Untitled", series: "s1", size: "11.8 × 8.5 in", hCm: 30.0, wCm: 21.6, medium: "Paper birch and archival ink marker", note: "", ratio: 0.6961, photo: "/works/07.webp" },
  { no: "08", title: "Untitled", series: "s1", size: "11.8 × 8.5 in", hCm: 30.0, wCm: 21.6, medium: "Paper birch and archival ink marker", note: "", ratio: 0.6961, photo: "/works/08.webp" },
  { no: "09", title: "Untitled", series: "s1", size: "48 × 52 cm", hCm: 48, wCm: 52, medium: "Pointer, gum arabic and paper birch", note: "Framed", ratio: 1.0303, photo: "/works/09.webp" },
  { no: "10", title: "Untitled", series: "s1", size: "37 × 61 cm", hCm: 37, wCm: 61, medium: "Pointer, gum arabic on paper birch and archival sheet", note: "Framed", ratio: 1.4234, photo: "/works/10.webp" },
  { no: "11", title: "Untitled", series: "s1", size: "106 × 76 cm", hCm: 76, wCm: 106, medium: "", note: "", ratio: 1.4896, photo: "/works/11.webp" },
  { no: "12", title: "Untitled", series: "s1", size: "47 × 73 cm", hCm: 73, wCm: 47, medium: "", note: "", ratio: 0.719, photo: "/works/12.webp" },
  { no: "13", title: "Untitled", series: "s1", size: "11.8 × 8.5 in", hCm: 30.0, wCm: 21.6, medium: "Paper birch and archival ink marker", note: "", ratio: 0.694, photo: "/works/13.webp" },
  { no: "14", title: "Untitled", series: "s1", size: "11.8 × 8.5 in", hCm: 30.0, wCm: 21.6, medium: "Paper birch and archival ink marker", note: "", ratio: 0.7145, photo: "/works/14.webp" },
  { no: "15", title: "Untitled", series: "s1", size: "11.8 × 8.5 in", hCm: 21.6, wCm: 30.0, medium: "Paper birch and archival ink marker", note: "", ratio: 1.4619, photo: "/works/15.webp" },
  { no: "16", title: "Untitled", series: "s1", size: "38 × 55 cm", hCm: 55, wCm: 38, medium: "Paper birch and archival ink marker", note: "", ratio: 0.8028, photo: "/works/16.webp" },
  { no: "17", title: "Untitled", series: "s1", size: "55 × 38 in", hCm: 96.5, wCm: 139.7, medium: "Pointer and ink on archival sheet", note: "", ratio: 1.522, photo: "/works/17.webp" },
  { no: "18", title: "Untitled", series: "s1", size: "11.8 × 8.5 in", hCm: 21.6, wCm: 30.0, medium: "Paper & archival ink marker", note: "", ratio: 1.4868, photo: "/works/18.webp" },
  { no: "19", title: "Untitled", series: "s1", size: "11.8 × 8.5 in", hCm: 21.6, wCm: 30.0, medium: "Paper & archival ink marker", note: "", ratio: 1.4305, photo: "/works/19.webp" },
  { no: "20", title: "Untitled", series: "s1", size: "11.8 × 8.5 in", hCm: 30.0, wCm: 21.6, medium: "Paper & archival ink marker", note: "", ratio: 0.682, photo: "/works/20.webp" },
  { no: "21", title: "Untitled", series: "s2", size: "12 × 17 in", hCm: 30.5, wCm: 43.2, medium: "Watercolour on paper", note: "", ratio: 1.4309, photo: "/works/21.webp" },
  { no: "22", title: "Untitled", series: "s2", size: "Variable", hCm: null, wCm: null, medium: "Digital treated image", note: "", ratio: 1.7977, photo: "/works/22.webp" },
  { no: "23", title: "Untitled", series: "s2", size: "Variable", hCm: null, wCm: null, medium: "Digital treated image", note: "", ratio: 1.7953, photo: "/works/23.webp" },
  { no: "24", title: "Untitled", series: "s2", size: "Variable", hCm: null, wCm: null, medium: "Digital treated image", note: "", ratio: 1.6053, photo: "/works/24.webp" },
  { no: "25", title: "Untitled", series: "s2", size: "Variable", hCm: null, wCm: null, medium: "Digital treated image", note: "", ratio: 1.3568, photo: "/works/25.webp" },
  { no: "26", title: "Untitled", series: "s2", size: "24 × 36 in", hCm: 91.4, wCm: 61.0, medium: "", note: "", ratio: 0.754, photo: "/works/26.webp" },
  { no: "27", title: "Justice", series: "s2", size: "Variable installation", hCm: null, wCm: null, medium: "Installation", note: "On process", ratio: 0.9982, photo: "/works/27.webp" },
  { no: "28", title: "Color Pallette", series: "s2", size: "20 × 48 cm", hCm: 20, wCm: 48, medium: "Watercolour on paper", note: "Not available", ratio: 1.6396, photo: "/works/28.webp" },
  { no: "29", title: "Law For Sale", series: "s2", size: "20 × 48 cm", hCm: 20, wCm: 48, medium: "Print on paper", note: "Not available", ratio: 1.6273, photo: "/works/29.webp" },
  { no: "30", title: "The Constitution", series: "s2", size: "30 × 40 × 5.08 cm", hCm: 40, wCm: 30, medium: "Print on paper, book installation", note: "", ratio: 0.984, photo: "/works/30.webp" },
  { no: "31", title: "Untitled", series: "s3", size: "18 × 24 in", hCm: 61.0, wCm: 45.7, medium: "Charcoal powder on archival sheet", note: "", ratio: 0.6642, photo: "/works/31.webp" },
  { no: "32", title: "Untitled", series: "s3", size: "18 × 24 in", hCm: 61.0, wCm: 45.7, medium: "Charcoal powder on archival sheet", note: "", ratio: 0.6993, photo: "/works/32.webp" },
  { no: "33", title: "Untitled", series: "s3", size: "18 × 24 in", hCm: 61.0, wCm: 45.7, medium: "Charcoal powder on archival sheet", note: "", ratio: 0.6397, photo: "/works/33.webp" },
  { no: "34", title: "Untitled", series: "s3", size: "18 × 24 in", hCm: 61.0, wCm: 45.7, medium: "Charcoal powder on archival sheet", note: "", ratio: 0.7429, photo: "/works/34.webp" },
  { no: "35", title: "Untitled", series: "s3", size: "5 × 6 in each", hCm: null, wCm: null, medium: "Charcoal powder on paper", note: "A set of portraits", ratio: 1.166, photo: "/works/35.webp" },
  { no: "36", title: "Untitled", series: "s4", size: "18 × 24 in", hCm: 61.0, wCm: 45.7, medium: "Embroidery and oil on canvas", note: "", ratio: 0.7498, photo: "/works/36.webp" },
  { no: "37", title: "Untitled", series: "s4", size: "18 × 24 in", hCm: 61.0, wCm: 45.7, medium: "Embroidery and oil on canvas", note: "", ratio: 0.7886, photo: "/works/37.webp" },
  { no: "38", title: "Untitled", series: "s4", size: "32.5 × 22.5 in", hCm: 57.1, wCm: 82.5, medium: "Embroidery and oil on canvas", note: "", ratio: 1.3632, photo: "/works/38.webp" },
  { no: "39", title: "Untitled", series: "s4", size: "17 × 22 in", hCm: 55.9, wCm: 43.2, medium: "Embroidery and oil on canvas", note: "", ratio: 0.8412, photo: "/works/39.webp" },
];

export const worksByNo = (no: string) => works.find((w) => w.no === no);
export const worksOf = (s: SeriesId) => works.filter((w) => w.series === s);
/** drawn on the true-size wall only when a single, fixed size is known */
export const hasSize = (w: Work) => w.hCm !== null && w.wCm !== null;
export const cm = (n: number) => `${Math.round(n * 10) / 10} cm`;
export const mediumOf = (w: Work) => w.medium || "Medium not listed";

/** shown first on the home page */
export const selected = ["03", "06", "17", "22", "26", "31", "38", "36"].map((n) => worksByNo(n)!);
