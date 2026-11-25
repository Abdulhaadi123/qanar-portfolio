import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { hasSupabase } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/server";
import { fallbackContent } from "./fallback";
import { phoneHref } from "./helpers";
import type { Availability, Content, Highlight, PostBlock, Social, TitledText } from "./types";

/** Tag used to refresh every public page after the admin saves something. */
export const CONTENT_TAG = "content";

/* ---- rows as the database returns them ---- */
interface SiteRow {
  name: string; name_urdu: string; role: string; base: string; origin: string; born: string;
  email: string; email2: string; phone: string; studio: string[]; studio2: string[];
  socials: Social[]; portfolio_pdf: string; bio: string; career: string[]; statement: string[]; statement_note: string;
  teaching_intro: string; teaching_principles: TitledText[]; commission_steps: TitledText[]; commission_intro: string;
  enquiry_kinds: string[]; hero_image: string; hero_tagline: string; hero_blurb: string; highlights: Highlight[];
  footer_blurb: string; seo_description: string; portrait_image: string; portrait_blur: string;
}
interface SeriesRow { id: string; slug: string; title: string; kind: string; medium: string; statement: string[]; cover_work_id: string | null }
interface WorkRow {
  id: string; no: string; title: string; series_id: string; size_text: string; h_cm: number | string | null; w_cm: number | string | null;
  medium: string; note: string; year: number | null; price: string; availability: Availability; ratio: number | string;
  photo: string; photo_md: string; photo_thumb: string; blur: string; featured_pos: number | null;
}
interface PostRow { id: string; slug: string; title: string; category: string; published_on: string; read_minutes: number; dek: string; body: PostBlock[] }
interface RecordRow { id: string; year: string; what: string; place: string; exhibition: boolean }

const num = (v: number | string | null) => (v === null || v === undefined ? null : Number(v));
const list = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** one read of everything the public site shows (5 small queries in parallel) */
async function loadFromDatabase(): Promise<Content> {
  const db = createPublicClient();
  const [site, series, works, posts, record] = await Promise.all([
    db.from("site_settings").select("*").eq("id", 1).maybeSingle<SiteRow>(),
    db.from("series").select("id,slug,title,kind,medium,statement,cover_work_id").order("position"),
    db.from("works").select("*").order("position"),
    db.from("journal_posts").select("id,slug,title,category,published_on,read_minutes,dek,body").order("published_on", { ascending: false }),
    db.from("record_entries").select("id,year,what,place,exhibition").order("position"),
  ]);
  for (const r of [site, series, works, posts, record]) if (r.error) throw new Error(r.error.message);
  if (!site.data) throw new Error("site_settings has no row");
  const sr = (series.data ?? []) as SeriesRow[];
  // a work belongs on the site only while its series is shown too (the database already hides hidden works and hidden series)
  const shown = new Set(sr.map((x) => x.id));
  const wr = ((works.data ?? []) as WorkRow[]).filter((w) => shown.has(w.series_id));
  // nothing visible at all (an empty or wrong database) is treated like an outage: the bundled copy is shown rather than an empty site
  if (!sr.length && !wr.length) throw new Error("no series or works are visible in the database");

  const s = site.data;
  const workNo = new Map(wr.map((w) => [w.id, w.no]));
  return {
    site: {
      name: s.name, nameUrdu: s.name_urdu, role: s.role, base: s.base, origin: s.origin, born: s.born,
      email: s.email, email2: s.email2, phone: s.phone, phoneHref: phoneHref(s.phone),
      studio: s.studio, studio2: s.studio2, socials: list<Social>(s.socials), portfolioPdf: s.portfolio_pdf,
      bio: s.bio, career: s.career, statement: s.statement, statementNote: s.statement_note,
      teachingIntro: s.teaching_intro, teachingPrinciples: list<TitledText>(s.teaching_principles),
      commissionSteps: list<TitledText>(s.commission_steps), commissionIntro: s.commission_intro,
      enquiryKinds: s.enquiry_kinds, heroImage: s.hero_image, heroTagline: s.hero_tagline, heroBlurb: s.hero_blurb,
      highlights: list<Highlight>(s.highlights), footerBlurb: s.footer_blurb, seoDescription: s.seo_description,
      portraitImage: s.portrait_image, portraitBlur: s.portrait_blur,
    },
    series: sr.map((x, i) => {
      const own = wr.filter((w) => w.series_id === x.id);
      const cover = (x.cover_work_id && own.some((w) => w.id === x.cover_work_id) ? workNo.get(x.cover_work_id) : own[0]?.no) ?? null;
      return { id: x.id, no: String(i + 1).padStart(2, "0"), slug: x.slug, title: x.title, kind: x.kind, medium: x.medium, statement: x.statement, cover };
    }),
    works: wr.map((w) => ({
      id: w.id, no: w.no, title: w.title, series: w.series_id, size: w.size_text, hCm: num(w.h_cm), wCm: num(w.w_cm),
      medium: w.medium, note: w.note, year: w.year, price: w.price, availability: w.availability, ratio: Number(w.ratio),
      photo: w.photo, photoMd: w.photo_md, photoThumb: w.photo_thumb, blur: w.blur, featuredPos: w.featured_pos,
    })),
    posts: ((posts.data ?? []) as PostRow[]).map((p) => ({
      id: p.id, slug: p.slug, title: p.title, category: p.category, date: p.published_on,
      read: `${p.read_minutes} min read`, dek: p.dek, body: list<PostBlock>(p.body),
    })),
    record: ((record.data ?? []) as RecordRow[]).map((r) => ({ id: r.id, year: r.year, what: r.what, where: r.place, exhibition: r.exhibition })),
  };
}

/**
 * Cached across requests and deployments. It is refreshed (a) at once, by updateTag(CONTENT_TAG) when the admin saves,
 * and (b) at most an hour later if the database was edited some other way. Failures are never cached.
 */
const cachedLoad = unstable_cache(loadFromDatabase, ["content-v1"], { tags: [CONTENT_TAG], revalidate: 3600 });

/**
 * The bundled copy, given a short life on purpose: a page that was built from it is rebuilt within a minute of the next visit,
 * so the site goes back to the database content as soon as the database is reachable again instead of keeping the old copy.
 */
const cachedFallback = unstable_cache(async () => fallbackContent, ["content-fallback-v1"], { tags: [CONTENT_TAG], revalidate: 60 });

/** Everything the public site shows. Never throws: if the database cannot be read the bundled copy is used. */
export const getContent = cache(async (): Promise<Content> => {
  if (!hasSupabase) return cachedFallback();
  try {
    return await cachedLoad();
  } catch (error) {
    console.error("[content] database unavailable, using the bundled copy:", error instanceof Error ? error.message : error);
    return cachedFallback();
  }
});
