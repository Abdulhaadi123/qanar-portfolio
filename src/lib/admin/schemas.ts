import { z } from "zod";

/** reads a FormData field as trimmed text */
export const text = (fd: FormData, name: string) => {
  const v = fd.get(name);
  return typeof v === "string" ? v.trim() : "";
};
export const flag = (fd: FormData, name: string) => fd.get(name) === "on" || fd.get(name) === "true";

/** reads a JSON array that a list editor put in a hidden field */
export function jsonList(fd: FormData, name: string): unknown[] {
  try {
    const v = JSON.parse(text(fd, name) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/** field name -> first message, from a zod error */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

const http = z
  .string()
  .trim()
  .max(500, "Too long.")
  .refine((v) => v === "" || /^https?:\/\/[^\s]+$/i.test(v), "Must start with http:// or https://");

const optionalNumber = (label: string, max: number) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d{1,5}([.,]\d{1,2})?$/.test(v) && Number(v.replace(",", ".")) > 0 && Number(v.replace(",", ".")) <= max), `${label}: a number above 0, up to ${max}.`)
    .transform((v) => (v === "" ? null : Number(v.replace(",", "."))));

export const slugOf = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Required.")
  .max(80, "At most 80 characters.")
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use small letters, numbers and single hyphens, e.g. echoes-on-birch.");

const strings = (max: number, maxItems: number) =>
  z
    .array(z.string().trim().max(max, `At most ${max} characters.`))
    .max(maxItems)
    .transform((a) => a.filter(Boolean));

/** the address of a photograph: either one of the site's own files or one in our storage bucket */
export const imageUrl = (mediaBase: string) =>
  z
    .string()
    .trim()
    .max(600)
    .refine((v) => v === "" || v.startsWith("/") || v.startsWith(`${mediaBase}/`), "That image is not from this site's storage.");

/* ---------------------------------------------------------------- works */
export const workSchema = (mediaBase: string) =>
  z
    .object({
      no: z.string().trim().min(1, "Required.").max(12, "At most 12 characters."),
      title: z.string().trim().min(1, "Required.").max(160, "At most 160 characters."),
      series_id: z.uuid("Choose a series."),
      size_text: z.string().trim().max(60, "At most 60 characters."),
      h_cm: optionalNumber("Height", 1000),
      w_cm: optionalNumber("Width", 1000),
      medium: z.string().trim().max(200, "At most 200 characters."),
      note: z.string().trim().max(200, "At most 200 characters."),
      year: z
        .string()
        .trim()
        .refine((v) => v === "" || (/^\d{4}$/.test(v) && Number(v) >= 1900 && Number(v) <= 2100), "A year such as 2024.")
        .transform((v) => (v === "" ? null : Number(v))),
      price: z.string().trim().max(60, "At most 60 characters."),
      availability: z.enum(["available", "sold", "not_available"], "Choose one."),
      visible: z.boolean(),
      featured: z.boolean(),
      photo: imageUrl(mediaBase).min(1, "Add a photograph."),
      photo_md: imageUrl(mediaBase).min(1),
      photo_thumb: imageUrl(mediaBase).min(1),
      blur: z.string().max(2000).refine((v) => v === "" || v.startsWith("data:image/webp;base64,"), "Invalid placeholder."),
      ratio: z
        .string()
        .trim()
        .refine((v) => Number(v) > 0.05 && Number(v) < 20, "Add a photograph.")
        .transform(Number),
    })
    .refine((v) => (v.h_cm === null) === (v.w_cm === null), { message: "Fill both height and width, or leave both empty.", path: ["h_cm"] });

/* ---------------------------------------------------------------- series */
export const seriesSchema = z.object({
  title: z.string().trim().min(1, "Required.").max(120, "At most 120 characters."),
  slug,
  kind: z.string().trim().max(60, "At most 60 characters."),
  medium: z.string().trim().max(200, "At most 200 characters."),
  statement: strings(4000, 12),
  cover_work_id: z.union([z.uuid(), z.literal("")]).transform((v) => (v === "" ? null : v)),
  visible: z.boolean(),
});

/* ---------------------------------------------------------------- site text */
const titledList = (max: number) =>
  z
    .array(z.object({ title: z.string().trim().max(120, "At most 120 characters."), text: z.string().trim().max(600, "At most 600 characters.") }))
    .max(max)
    .transform((a) => a.filter((x) => x.title || x.text));

export const identitySchema = z.object({
  name: z.string().trim().min(1, "Required.").max(120),
  name_urdu: z.string().trim().max(120),
  role: z.string().trim().max(120),
  base: z.string().trim().max(120),
  origin: z.string().trim().max(160),
  born: z.string().trim().max(20),
  email: z.union([z.literal(""), z.email("Not a valid email address.")]),
  email2: z.union([z.literal(""), z.email("Not a valid email address.")]),
  phone: z.string().trim().max(40),
  studio: strings(120, 6),
  studio2: strings(120, 6),
  socials: z
    .array(z.object({ label: z.string().trim().max(40), handle: z.string().trim().max(80), href: http }))
    .max(12)
    .transform((a) => a.filter((x) => x.label || x.href)),
  portfolio_pdf: http,
});

export const homeSchema = z.object({
  hero_tagline: z.string().trim().max(300, "At most 300 characters."),
  hero_blurb: z.string().trim().max(400, "At most 400 characters."),
  highlights: z
    .array(z.object({ k: z.string().trim().max(40), v: z.string().trim().max(200) }))
    .max(8)
    .transform((a) => a.filter((x) => x.k || x.v)),
  commission_intro: z.string().trim().max(500, "At most 500 characters."),
  commission_steps: titledList(8),
  footer_blurb: z.string().trim().max(400, "At most 400 characters."),
  seo_description: z.string().trim().max(320, "At most 320 characters (search engines cut it there)."),
  enquiry_kinds: strings(60, 8),
});

export const aboutSchema = z.object({
  bio: z.string().trim().max(1500, "At most 1500 characters."),
  career: strings(3000, 8),
  statement: strings(3000, 8),
  statement_note: z.string().trim().max(600, "At most 600 characters."),
  teaching_intro: z.string().trim().max(800, "At most 800 characters."),
  teaching_principles: titledList(8),
});

/* ---------------------------------------------------------------- record */
export const recordSchema = z
  .array(
    z.object({
      id: z.string().optional(),
      year: z.string().trim().max(12, "At most 12 characters."),
      what: z.string().trim().min(1, "Required.").max(300, "At most 300 characters."),
      place: z.string().trim().max(200, "At most 200 characters."),
      exhibition: z.boolean().default(false),
    }),
  )
  .max(80);

/* ---------------------------------------------------------------- journal */
export const postSchema = z.object({
  title: z.string().trim().min(1, "Required.").max(200, "At most 200 characters."),
  slug,
  category: z.string().trim().max(60, "At most 60 characters."),
  published_on: z.string().refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)), "A date such as 2026-11-25."),
  dek: z.string().trim().max(500, "At most 500 characters."),
  body: z
    .array(z.object({ type: z.enum(["p", "h", "quote"]), text: z.string().trim().max(6000, "At most 6000 characters.") }))
    .max(200)
    .transform((a) => a.filter((b) => b.text)),
  published: z.boolean(),
});

/* ---------------------------------------------------------------- enquiries, password */
export const enquiryUpdateSchema = z.object({
  status: z.enum(["new", "read", "replied", "archived"]),
  admin_note: z.string().trim().max(2000, "At most 2000 characters."),
});

/** the same rule as the project's Auth setting: 12+ characters with a lowercase letter, a capital letter and a digit */
export const passwordSchema = z
  .string()
  .min(12, "At least 12 characters.")
  .max(200)
  .regex(/[a-z]/, "Add a small letter.")
  .regex(/[A-Z]/, "Add a capital letter.")
  .regex(/\d/, "Add a digit.");

export const loginSchema = z.object({
  email: z.email("Enter your email address.").max(200),
  password: z.string().min(1, "Enter your password.").max(200),
});
