// Run with:  npm test   (Node 22+, no extra packages: it imports the project's TypeScript files directly)
import assert from "node:assert/strict";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const load = (p) => import(pathToFileURL(join(root, p)).href);
const S = await load("src/lib/admin/schemas.ts");
const H = await load("src/lib/content/helpers.ts");

const MEDIA = "https://abc.supabase.co/storage/v1/object/public/media";
const UUID = "6f1c2b9e-1111-4222-8333-444455556666";
const goodWork = {
  no: "40", title: "Untitled", series_id: UUID, size_text: "12 × 12 in", h_cm: "30.5", w_cm: "30,5", medium: "Ink", note: "", year: "2025",
  price: "", availability: "available", visible: true, featured: false,
  photo: `${MEDIA}/work/x/full.webp`, photo_md: `${MEDIA}/work/x/md.webp`, photo_thumb: `${MEDIA}/work/x/thumb.webp`, blur: "data:image/webp;base64,AAAA", ratio: "1.0",
};
const bad = (r, key) => assert.equal(r.success, false) || assert.ok(S.fieldErrors(r.error)[key], `expected an error on "${key}", got ${JSON.stringify(S.fieldErrors(r.error))}`);

test("form readers", () => {
  const fd = new FormData();
  fd.set("a", "  hello ");
  fd.set("on", "on");
  fd.set("list", '["x","y"]');
  fd.set("broken", "{not json");
  fd.set("obj", '{"a":1}');
  assert.equal(S.text(fd, "a"), "hello");
  assert.equal(S.text(fd, "missing"), "");
  assert.equal(S.flag(fd, "on"), true);
  assert.equal(S.flag(fd, "missing"), false);
  assert.deepEqual(S.jsonList(fd, "list"), ["x", "y"]);
  assert.deepEqual(S.jsonList(fd, "broken"), []);
  assert.deepEqual(S.jsonList(fd, "obj"), []);
  assert.deepEqual(S.jsonList(fd, "missing"), []);
});

test("slugOf", () => {
  assert.equal(S.slugOf("Echoes on Birch"), "echoes-on-birch");
  assert.equal(S.slugOf("Constitution & Currency"), "constitution-and-currency");
  assert.equal(S.slugOf("  Café — Noël!!  "), "cafe-noel");
  assert.equal(S.slugOf("قمر"), "");
  assert.ok(S.slugOf("a".repeat(200)).length <= 80);
});

test("work: a good form passes and is converted", () => {
  const r = S.workSchema(MEDIA).safeParse(goodWork);
  assert.equal(r.success, true, JSON.stringify(r.error?.issues));
  assert.equal(r.data.h_cm, 30.5);
  assert.equal(r.data.w_cm, 30.5, "comma decimals are accepted");
  assert.equal(r.data.year, 2025);
  assert.equal(r.data.ratio, 1);
});

test("work: bad input is refused with a message on the right field", () => {
  const w = (patch) => S.workSchema(MEDIA).safeParse({ ...goodWork, ...patch });
  bad(w({ no: "" }), "no");
  bad(w({ no: "1234567890123" }), "no");
  bad(w({ title: "" }), "title");
  bad(w({ title: "x".repeat(161) }), "title");
  bad(w({ series_id: "not-a-uuid" }), "series_id");
  bad(w({ h_cm: "10", w_cm: "" }), "h_cm");
  bad(w({ h_cm: "", w_cm: "10" }), "h_cm");
  bad(w({ h_cm: "-5", w_cm: "5" }), "h_cm");
  bad(w({ h_cm: "abc", w_cm: "5" }), "h_cm");
  bad(w({ h_cm: "5000", w_cm: "5" }), "h_cm");
  bad(w({ year: "20x5" }), "year");
  bad(w({ year: "1800" }), "year");
  bad(w({ availability: "free" }), "availability");
  bad(w({ photo: "" }), "photo");
  bad(w({ photo: "https://evil.example/x.webp" }), "photo");
  bad(w({ photo: "javascript:alert(1)" }), "photo");
  bad(w({ ratio: "" }), "ratio");
  bad(w({ ratio: "0" }), "ratio");
  bad(w({ blur: "data:text/html;base64,AAAA" }), "blur");
  assert.equal(w({ h_cm: "", w_cm: "" }).success, true, "no size at all is fine");
  assert.equal(w({ photo: "/works/01.webp", photo_md: "/works/md/01.webp", photo_thumb: "/works/thumb/01.webp" }).success, true, "files shipped with the site are fine");
});

test("series", () => {
  const ok = { title: "Echoes", slug: "echoes-on-birch", kind: "Series 1", medium: "", statement: ["a", " ", "b"], cover_work_id: "", visible: true };
  const r = S.seriesSchema.safeParse(ok);
  assert.equal(r.success, true);
  assert.deepEqual(r.data.statement, ["a", "b"], "blank paragraphs are dropped");
  assert.equal(r.data.cover_work_id, null);
  bad(S.seriesSchema.safeParse({ ...ok, slug: "Bad Slug" }), "slug");
  bad(S.seriesSchema.safeParse({ ...ok, slug: "-x" }), "slug");
  bad(S.seriesSchema.safeParse({ ...ok, slug: "a--b" }), "slug");
  bad(S.seriesSchema.safeParse({ ...ok, title: "" }), "title");
  bad(S.seriesSchema.safeParse({ ...ok, cover_work_id: "nope" }), "cover_work_id");
  assert.equal(S.seriesSchema.safeParse({ ...ok, cover_work_id: UUID }).data.cover_work_id, UUID);
});

test("identity: emails, links, lists", () => {
  const ok = {
    name: "Qamar Abbas", name_urdu: "قمر عباس", role: "", base: "", origin: "", born: "1997", email: "a@b.co", email2: "", phone: "+92 300 1",
    studio: ["Line 1", " ", "Line 2"], studio2: [], socials: [{ label: "Instagram", handle: "@x", href: "https://instagram.com/x" }, { label: "", handle: "", href: "" }], portfolio_pdf: "",
  };
  const r = S.identitySchema.safeParse(ok);
  assert.equal(r.success, true, JSON.stringify(r.error?.issues));
  assert.deepEqual(r.data.studio, ["Line 1", "Line 2"]);
  assert.equal(r.data.socials.length, 1, "an empty social row is dropped");
  bad(S.identitySchema.safeParse({ ...ok, name: "" }), "name");
  bad(S.identitySchema.safeParse({ ...ok, email: "nope" }), "email");
  bad(S.identitySchema.safeParse({ ...ok, email2: "x@" }), "email2");
  bad(S.identitySchema.safeParse({ ...ok, portfolio_pdf: "javascript:alert(1)" }), "portfolio_pdf");
  bad(S.identitySchema.safeParse({ ...ok, portfolio_pdf: "ftp://x.example/a.pdf" }), "portfolio_pdf");
  bad(S.identitySchema.safeParse({ ...ok, socials: [{ label: "X", handle: "", href: "javascript:alert(1)" }] }), "socials.0.href");
  bad(S.identitySchema.safeParse({ ...ok, socials: [{ label: "X", handle: "", href: "data:text/html,hi" }] }), "socials.0.href");
  assert.equal(S.identitySchema.safeParse({ ...ok, portfolio_pdf: "https://files.example/a.pdf" }).success, true);
});

test("home and about text", () => {
  const home = { hero_tagline: "t", hero_blurb: "b", highlights: [{ k: "Education", v: "x" }, { k: "", v: "" }], commission_intro: "", commission_steps: [{ title: "A", text: "b" }, { title: "", text: "" }], footer_blurb: "", seo_description: "d", enquiry_kinds: ["Buy", ""] };
  const r = S.homeSchema.safeParse(home);
  assert.equal(r.success, true);
  assert.equal(r.data.highlights.length, 1);
  assert.equal(r.data.commission_steps.length, 1);
  assert.deepEqual(r.data.enquiry_kinds, ["Buy"]);
  bad(S.homeSchema.safeParse({ ...home, seo_description: "x".repeat(321) }), "seo_description");
  bad(S.homeSchema.safeParse({ ...home, hero_blurb: "x".repeat(401) }), "hero_blurb");
  const about = { bio: "b", career: ["a", ""], statement: [], statement_note: "", teaching_intro: "", teaching_principles: [] };
  assert.equal(S.aboutSchema.safeParse(about).success, true);
  bad(S.aboutSchema.safeParse({ ...about, bio: "x".repeat(1501) }), "bio");
  bad(S.aboutSchema.safeParse({ ...about, career: ["x".repeat(3001)] }), "career.0");
});

test("record rows", () => {
  assert.equal(S.recordSchema.safeParse([{ year: "2025", what: "Show", place: "", exhibition: true }, { id: "abc", year: "", what: "Born", place: "G-B" }]).success, true);
  bad(S.recordSchema.safeParse([{ year: "2025", what: "", place: "" }]), "0.what");
  bad(S.recordSchema.safeParse([{ year: "2025", what: "ok", place: "" }, { year: "123456789012345", what: "x", place: "" }]), "1.year");
  assert.equal(S.recordSchema.safeParse(Array.from({ length: 81 }, () => ({ year: "", what: "x", place: "" }))).success, false);
});

test("journal post", () => {
  const ok = { title: "T", slug: "a-post", category: "", published_on: "2026-11-25", dek: "", body: [{ type: "p", text: "Hello" }, { type: "h", text: "  " }], published: true };
  const r = S.postSchema.safeParse(ok);
  assert.equal(r.success, true);
  assert.equal(r.data.body.length, 1, "blank blocks are dropped");
  bad(S.postSchema.safeParse({ ...ok, published_on: "25/11/2026" }), "published_on");
  bad(S.postSchema.safeParse({ ...ok, published_on: "2026-13-45" }), "published_on");
  bad(S.postSchema.safeParse({ ...ok, slug: "Has Space" }), "slug");
  bad(S.postSchema.safeParse({ ...ok, body: [{ type: "script", text: "x" }] }), "body.0.type");
  bad(S.postSchema.safeParse({ ...ok, title: "" }), "title");
});

test("password rule matches the Auth setting (12+, lower, upper, digit)", () => {
  for (const weak of ["short1A", "alllowercase123456", "ALLUPPERCASE123456", "NoDigitsHereAtAll", "x".repeat(201)]) assert.equal(S.passwordSchema.safeParse(weak).success, false, weak);
  for (const strong of ["Correct1Horse9Staple", "My studio is in Lahore 2026"]) assert.equal(S.passwordSchema.safeParse(strong).success, true, strong);
});

test("login and enquiry status", () => {
  assert.equal(S.loginSchema.safeParse({ email: "a@b.co", password: "x" }).success, true);
  bad(S.loginSchema.safeParse({ email: "nope", password: "x" }), "email");
  bad(S.loginSchema.safeParse({ email: "a@b.co", password: "" }), "password");
  assert.equal(S.enquiryUpdateSchema.safeParse({ status: "replied", admin_note: "" }).success, true);
  bad(S.enquiryUpdateSchema.safeParse({ status: "deleted", admin_note: "" }), "status");
});

test("content helpers", () => {
  assert.equal(H.priceLabel({ availability: "available", price: "" }), "On request");
  assert.equal(H.priceLabel({ availability: "available", price: " PKR 90,000 " }), "PKR 90,000");
  assert.equal(H.priceLabel({ availability: "sold", price: "PKR 1" }), "Sold");
  assert.equal(H.priceLabel({ availability: "not_available", price: "" }), "Not available");
  assert.equal(H.numberWord(4), "four");
  assert.equal(H.numberWord(12), "12");
  assert.deepEqual(H.splitLast("Echoes on Birch"), ["Echoes on", "Birch"]);
  assert.deepEqual(H.splitLast("Solo"), ["", "Solo"]);
  assert.deepEqual(H.splitName("Qamar Abbas"), ["Qamar", "Abbas"]);
  assert.deepEqual(H.splitName("Qamar"), ["Qamar", ""]);
  assert.equal(H.placesLine({ base: "Lahore, Pakistan", origin: "Oshikhandass valley, Gilgit-Baltistan" }), "Lahore / Gilgit-Baltistan");
  assert.equal(H.placesLine({ base: "", origin: "" }), "");
  assert.equal(H.phoneHref("+92 348 4653180"), "+923484653180");
  assert.equal(H.mediumOf({ medium: "" }), "Medium not listed");
  assert.equal(H.hasSize({ hCm: 1, wCm: 2 }), true);
  assert.equal(H.hasSize({ hCm: null, wCm: null }), false);
  assert.equal(H.readMinutes([{ p: "word ".repeat(199) }]), 1);
  assert.equal(H.readMinutes([{ p: "word ".repeat(201) }]), 2);
  assert.equal(H.readMinutes([]), 1);
  assert.equal(H.formatDate("2026-10-12"), "12 October 2026");

  const works = [
    { no: "1", featuredPos: 2, series: "a" }, { no: "2", featuredPos: null, series: "a" }, { no: "3", featuredPos: 1, series: "b" },
  ];
  assert.deepEqual(H.featuredWorks(works).map((w) => w.no), ["3", "1"], "featured works are in the order set in the admin");
  assert.deepEqual(H.worksOf(works, "a").map((w) => w.no), ["1", "2"]);

  const stats = H.statsOf(works, [{}, {}], [
    { year: "2019", what: "x", where: "Lahore", exhibition: true }, { year: "2014", what: "y", where: "Karachi", exhibition: true },
    { year: "2020", what: "degree", where: "NCA", exhibition: false }, { year: "", what: "residency", where: "Hunza", exhibition: true },
  ]);
  assert.deepEqual(stats, { works: 3, series: 2, shows: 3, firstYear: 2014, firstPlace: "Karachi" });
  assert.equal(H.statsOf([], [], []).firstYear, null);
});

test("the bundled copy (src/data, the fallback and the seed's source) is consistent", async () => {
  const { works, selected } = await load("src/data/works.ts");
  const { series } = await load("src/data/series.ts");
  const { posts } = await load("src/data/journal.ts");
  const { record } = await load("src/data/site.ts");
  const { existsSync } = await import("node:fs");
  assert.equal(works.length, 39);
  assert.equal(series.length, 4);
  assert.equal(posts.length, 3);
  assert.equal(record.length, 14);
  assert.equal(selected.length, 8);
  assert.equal(new Set(works.map((w) => w.no)).size, 39, "work numbers are unique");
  assert.ok(works.every((w) => series.some((s) => s.id === w.series)), "every work has a series");
  assert.ok(series.every((s) => works.some((w) => w.no === s.cover && w.series === s.id)), "every series cover is a work of that series");
  for (const w of works) {
    for (const dir of ["", "md/", "thumb/"]) assert.ok(existsSync(join(root, "public", "works", `${dir}${w.no}.webp`)), `missing public/works/${dir}${w.no}.webp`);
  }
  assert.ok(works.every((w) => (w.hCm === null) === (w.wCm === null)), "height and width come together");
});
