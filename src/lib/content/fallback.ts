/**
 * The bundled copy of the content (src/data/*.ts). It is what supabase/seed.sql was made from, and it is what the public
 * site falls back to if the database cannot be reached (a paused free project, an outage, a missing key), so the site never shows an error.
 */
import { alsoOnWix, bio, career, commissionSteps, enquiryKinds, record as staticRecord, site as s, statement, teaching } from "@/data/site";
import { series as staticSeries } from "@/data/series";
import { posts as staticPosts } from "@/data/journal";
import { works as staticWorks, selected } from "@/data/works";
import { phoneHref } from "./helpers";
import type { Content } from "./types";

const featured = new Map(selected.map((w, i) => [w.no, i + 1]));

export const fallbackContent: Content = {
  site: {
    name: s.name,
    nameUrdu: s.nameUrdu,
    role: s.role,
    base: s.base,
    origin: s.origin,
    born: s.born,
    email: s.email,
    email2: s.email2,
    phone: s.phone,
    phoneHref: phoneHref(s.phone),
    studio: s.studio,
    studio2: s.studio2,
    socials: s.socials,
    portfolioPdf: s.portfolioPdf,
    bio,
    career,
    statement,
    statementNote: alsoOnWix,
    teachingIntro: teaching.intro,
    teachingPrinciples: teaching.principles.map(({ title, text }) => ({ title, text })),
    commissionSteps: commissionSteps.map(({ title, text }) => ({ title, text })),
    commissionIntro: "Verses, names, prayers or poetry — composed and written by hand, in a classical script or a contemporary style.",
    enquiryKinds,
    heroImage: "/media/hero-bark.webp",
    heroTagline: "Calligraphy on paper birch. Landscape, cultural memory, and the visual language of power.",
    heroBlurb:
      "Bhojpatra bark from the mountains of Gilgit-Baltistan, written on in Khat-e-Suls: landscape and cultural memory, one sheet at a time.",
    highlights: [
      { k: "Education", v: "Fine Arts, painting: National College of Arts, Lahore (2020)" },
      { k: "Recognition", v: "Winner, Asia Pacific Regional Art Contest (2022)" },
    ],
    footerBlurb: "To buy a work, commission a piece, or invite me for a talk or class — send a message and I’ll reply by email.",
    seoDescription:
      "Qamar Abbas is a visual artist born in 1997 in the Oshikhandass valley of Gilgit-Baltistan, based in Lahore. Birch bark and ink, constitution and currency, charcoal portraits of the mountain people, and embroidery.",
    portraitImage: "/media/portrait.jpg",
    portraitBlur: "",
  },
  series: staticSeries.map((x, i) => ({
    id: x.id,
    no: String(i + 1).padStart(2, "0"),
    slug: x.slug,
    title: x.title,
    kind: x.kind,
    medium: x.medium,
    statement: x.statement,
    cover: x.cover,
  })),
  works: staticWorks.map((w) => ({
    id: w.no,
    no: w.no,
    title: w.title,
    series: w.series,
    size: w.size,
    hCm: w.hCm,
    wCm: w.wCm,
    medium: w.medium,
    note: w.note === "Not available" ? "" : w.note,
    year: null,
    price: "",
    availability: w.note === "Not available" ? ("not_available" as const) : ("available" as const),
    ratio: w.ratio,
    photo: w.photo,
    photoMd: `/works/md/${w.no}.webp`,
    photoThumb: `/works/thumb/${w.no}.webp`,
    blur: "",
    featuredPos: featured.get(w.no) ?? null,
  })),
  posts: staticPosts.map((p) => ({
    id: p.slug,
    slug: p.slug,
    title: p.title,
    category: p.category,
    date: p.date,
    read: p.read,
    dek: p.dek,
    body: p.body,
  })),
  record: staticRecord.map((r, i) => ({
    id: String(i),
    year: r.year === "—" ? "" : r.year,
    what: r.what,
    where: r.where,
    exhibition: /^(2014|2016|2019|2022|2024|2025)$/.test(r.year) && !/Degree|Series 4|Born|residency|educator/i.test(r.what),
  })),
};
