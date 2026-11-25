"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { guardAction } from "@/lib/admin/auth";
import { removeMedia } from "@/lib/admin/media";
import { publish } from "@/lib/admin/publish";
import { type ActionState, dbMessage, done, fail } from "@/lib/admin/result";
import { aboutSchema, fieldErrors, homeSchema, identitySchema, imageUrl, jsonList, recordSchema, text } from "@/lib/admin/schemas";
import { MEDIA_BASE } from "@/lib/supabase/config";

const strs = (fd: FormData, name: string) => jsonList(fd, name).map((x) => (typeof x === "string" ? x : ""));
const objs = (fd: FormData, name: string) => jsonList(fd, name).filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null);

async function update(supabase: SupabaseClient, patch: Record<string, unknown>): Promise<ActionState> {
  const { error } = await supabase.from("site_settings").update(patch).eq("id", 1);
  if (error) return fail(dbMessage(error));
  publish();
  return done("Saved. The public site shows the change now.");
}

export async function saveIdentity(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const gate = await guardAction();
  if (!gate.ok) return gate.state;
  const parsed = identitySchema.safeParse({
    name: text(fd, "name"),
    name_urdu: text(fd, "name_urdu"),
    role: text(fd, "role"),
    base: text(fd, "base"),
    origin: text(fd, "origin"),
    born: text(fd, "born"),
    email: text(fd, "email"),
    email2: text(fd, "email2"),
    phone: text(fd, "phone"),
    studio: strs(fd, "studio"),
    studio2: strs(fd, "studio2"),
    socials: objs(fd, "socials"),
    portfolio_pdf: text(fd, "portfolio_pdf"),
  });
  if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrors(parsed.error));
  return update(gate.admin.supabase, parsed.data);
}

export async function saveHome(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const gate = await guardAction();
  if (!gate.ok) return gate.state;
  const parsed = homeSchema.safeParse({
    hero_tagline: text(fd, "hero_tagline"),
    hero_blurb: text(fd, "hero_blurb"),
    highlights: objs(fd, "highlights"),
    commission_intro: text(fd, "commission_intro"),
    commission_steps: objs(fd, "commission_steps"),
    footer_blurb: text(fd, "footer_blurb"),
    seo_description: text(fd, "seo_description"),
    enquiry_kinds: strs(fd, "enquiry_kinds"),
  });
  if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrors(parsed.error));
  if (parsed.data.enquiry_kinds.length < 1) return fail("Add at least one kind of enquiry.", { enquiry_kinds: "Add at least one." });
  return update(gate.admin.supabase, parsed.data);
}

export async function saveAbout(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const gate = await guardAction();
  if (!gate.ok) return gate.state;
  const parsed = aboutSchema.safeParse({
    bio: text(fd, "bio"),
    career: strs(fd, "career"),
    statement: strs(fd, "statement"),
    statement_note: text(fd, "statement_note"),
    teaching_intro: text(fd, "teaching_intro"),
    teaching_principles: objs(fd, "teaching_principles"),
  });
  if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrors(parsed.error));
  return update(gate.admin.supabase, parsed.data);
}

/** the hero sheet's photograph and the portrait: both uploaded straight to storage by the browser, then recorded here */
export async function saveImages(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const gate = await guardAction();
  if (!gate.ok) return gate.state;
  const { supabase } = gate.admin;
  const url = imageUrl(MEDIA_BASE);
  const hero = url.safeParse(text(fd, "hero_image"));
  const portrait = url.safeParse(text(fd, "portrait_image"));
  const blur = text(fd, "portrait_blur");
  if (!hero.success || !portrait.success) return fail("One of the pictures is not from this site's storage. Upload it again.");
  if (blur && !blur.startsWith("data:image/webp;base64,")) return fail("Invalid placeholder. Upload the portrait again.");

  const { data: before } = await supabase.from("site_settings").select("hero_image,portrait_image").eq("id", 1).maybeSingle();
  const patch: Record<string, string> = {};
  if (hero.data) patch.hero_image = hero.data;
  if (portrait.data) {
    patch.portrait_image = portrait.data;
    patch.portrait_blur = blur;
  }
  if (!Object.keys(patch).length) return fail("Nothing to save.");
  const { error } = await supabase.from("site_settings").update(patch).eq("id", 1);
  if (error) return fail(dbMessage(error));
  if (before) {
    await removeMedia(supabase, [
      patch.hero_image && patch.hero_image !== before.hero_image ? before.hero_image : null,
      patch.portrait_image && patch.portrait_image !== before.portrait_image ? before.portrait_image : null,
    ]);
  }
  publish();
  return done("Saved. The public site shows the new pictures now.");
}

/** the exhibitions & record list: rows are kept, added, changed and removed to match what the editor sent, in its order */
export async function saveRecord(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const gate = await guardAction();
  if (!gate.ok) return gate.state;
  const { supabase } = gate.admin;
  const parsed = recordSchema.safeParse(objs(fd, "record"));
  if (!parsed.success) return fail("Please fix the highlighted rows.", fieldErrors(parsed.error));
  const rows = parsed.data;

  const { data: existing, error: readError } = await supabase.from("record_entries").select("id");
  if (readError) return fail(dbMessage(readError));
  const known = new Set((existing ?? []).map((r) => r.id as string));
  // add and update first, remove last: if something fails half-way nothing has been lost
  const upserts = rows.map((r, i) => ({
    ...(r.id && known.has(r.id) ? { id: r.id } : {}),
    year: r.year,
    what: r.what,
    place: r.place,
    exhibition: r.exhibition,
    position: i + 1,
  }));
  if (upserts.length) {
    const withId = upserts.filter((u) => "id" in u);
    const without = upserts.filter((u) => !("id" in u));
    if (withId.length) {
      const { error } = await supabase.from("record_entries").upsert(withId);
      if (error) return fail(dbMessage(error));
    }
    if (without.length) {
      const { error } = await supabase.from("record_entries").insert(without);
      if (error) return fail(dbMessage(error));
    }
  }
  const keep = new Set(rows.map((r) => r.id).filter((x): x is string => Boolean(x && known.has(x))));
  const drop = [...known].filter((id) => !keep.has(id));
  if (drop.length) {
    const { error } = await supabase.from("record_entries").delete().in("id", drop);
    if (error) return fail(dbMessage(error));
  }
  publish();
  return done("Saved. The public site shows the change now.");
}
