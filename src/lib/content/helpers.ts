/** Small pure helpers that work on the content arrays. Safe in both server and client components. */
import type { Availability, Post, RecordEntry, Series, SeriesId, SiteSettings, Work } from "./types";

export const worksOf = (works: Work[], id: SeriesId) => works.filter((w) => w.series === id);
export const worksByNo = (works: Work[], no: string) => works.find((w) => w.no === no);
export const seriesById = (series: Series[], id: SeriesId) => series.find((s) => s.id === id);

/** drawn on the true-size wall only when a single, fixed size is known */
export const hasSize = (w: Work) => w.hCm !== null && w.wCm !== null;
export const cm = (n: number) => `${Math.round(n * 10) / 10} cm`;
export const mediumOf = (w: Pick<Work, "medium">) => w.medium || "Medium not listed";

/** the works shown first on the home page, in the order set in the admin panel */
export const featuredWorks = (works: Work[]) =>
  works
    .filter((w) => w.featuredPos !== null)
    .sort((a, b) => (a.featuredPos ?? 0) - (b.featuredPos ?? 0));

/** what the "Price" row says */
export function priceLabel(w: Pick<Work, "availability" | "price">): string {
  const map: Record<Availability, string | null> = { available: null, sold: "Sold", not_available: "Not available" };
  return map[w.availability] ?? (w.price.trim() || "On request");
}

export const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
/** 4 -> "four" (small numbers read better as words in a sentence) */
export const numberWord = (n: number) => WORDS[n] ?? String(n);

/** "Echoes on Birch" -> ["Echoes on", "Birch"], the last word is set in italics */
export function splitLast(title: string): [string, string] {
  const i = title.trim().lastIndexOf(" ");
  return i < 0 ? ["", title.trim()] : [title.slice(0, i).trim(), title.slice(i + 1).trim()];
}

/** "Qamar Abbas" -> ["Qamar", "Abbas"] */
export function splitName(name: string): [string, string] {
  const i = name.trim().indexOf(" ");
  return i < 0 ? [name.trim(), ""] : [name.slice(0, i).trim(), name.slice(i + 1).trim()];
}

/** "Lahore, Pakistan" + "Oshikhandass valley, Gilgit-Baltistan" -> "Lahore / Gilgit-Baltistan" */
export function placesLine(site: Pick<SiteSettings, "base" | "origin">): string {
  const a = site.base.split(",")[0]?.trim() ?? "";
  const b = site.origin.split(",").pop()?.trim() ?? "";
  return [a, b].filter(Boolean).join(" / ");
}

export const phoneHref = (phone: string) => phone.replace(/[^\d+]/g, "");

/** numbers shown in the "in numbers" strip, counted from the data */
export function statsOf(works: Work[], series: Series[], record: RecordEntry[]) {
  const shows = record.filter((r) => r.exhibition);
  const years = shows.map((r) => parseInt(r.year, 10)).filter((y) => Number.isFinite(y));
  const first = years.length ? Math.min(...years) : null;
  const firstEntry = first === null ? null : shows.find((r) => parseInt(r.year, 10) === first) ?? null;
  return { works: works.length, series: series.length, shows: shows.length, firstYear: first, firstPlace: firstEntry?.where ?? "" };
}

export const postById = (posts: Post[], slug: string) => posts.find((p) => p.slug === slug);

/** words per minute, rounded up, never less than 1 */
export function readMinutes(blocks: { h?: string; p?: string; quote?: string }[]): number {
  const words = blocks.map((b) => b.h ?? b.p ?? b.quote ?? "").join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
