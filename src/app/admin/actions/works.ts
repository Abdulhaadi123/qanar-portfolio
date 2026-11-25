"use server";

import { redirect } from "next/navigation";
import { guardAction, requireAdmin } from "@/lib/admin/auth";
import { removeMedia } from "@/lib/admin/media";
import { publish } from "@/lib/admin/publish";
import { moveRow } from "@/lib/admin/order";
import { type ActionState, dbMessage, done, fail } from "@/lib/admin/result";
import { fieldErrors, flag, text, workSchema } from "@/lib/admin/schemas";
import { MEDIA_BASE } from "@/lib/supabase/config";

const maxOf = (rows: { v: number | null }[] | null) => rows?.reduce((m, r) => Math.max(m, r.v ?? 0), 0) ?? 0;

/** create (id = null) or update a work */
export async function saveWork(id: string | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const gate = await guardAction();
  if (!gate.ok) return gate.state;
  const { supabase } = gate.admin;
  const parsed = workSchema(MEDIA_BASE).safeParse({
    no: text(fd, "no"),
    title: text(fd, "title"),
    series_id: text(fd, "series_id"),
    size_text: text(fd, "size_text"),
    h_cm: text(fd, "h_cm"),
    w_cm: text(fd, "w_cm"),
    medium: text(fd, "medium"),
    note: text(fd, "note"),
    year: text(fd, "year"),
    price: text(fd, "price"),
    availability: text(fd, "availability"),
    visible: flag(fd, "visible"),
    featured: flag(fd, "featured"),
    photo: text(fd, "photo"),
    photo_md: text(fd, "photo_md"),
    photo_thumb: text(fd, "photo_thumb"),
    blur: text(fd, "blur"),
    ratio: text(fd, "ratio"),
  });
  if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrors(parsed.error));
  const { featured, ...v } = parsed.data;

  // order: a new work goes to the end; a work that becomes featured goes to the end of the featured ones
  let featuredPos: number | null = null;
  let position: number | undefined;
  let before: { photo: string; photo_md: string; photo_thumb: string; featured_pos: number | null } | null = null;
  if (id) {
    const { data } = await supabase.from("works").select("photo,photo_md,photo_thumb,featured_pos").eq("id", id).maybeSingle();
    if (!data) return fail("That work no longer exists. Go back to the list.");
    before = data;
  } else {
    const { data } = await supabase.from("works").select("v:position");
    position = maxOf(data as { v: number | null }[] | null) + 1;
  }
  if (featured) {
    if (before?.featured_pos != null) featuredPos = before.featured_pos;
    else {
      const { data } = await supabase.from("works").select("v:featured_pos").not("featured_pos", "is", null);
      featuredPos = maxOf(data as { v: number | null }[] | null) + 1;
    }
  }

  const row = { ...v, featured_pos: featuredPos, ...(position !== undefined ? { position } : {}) };
  if (!id) {
    const { data, error } = await supabase.from("works").insert(row).select("id").single();
    if (error || !data) return fail(dbMessage(error, "That number"), error?.code === "23505" ? { no: "Already used by another work." } : undefined);
    publish();
    redirect(`/admin/works/${data.id}?saved=1`);
  }

  const { error } = await supabase.from("works").update(row).eq("id", id);
  if (error) return fail(dbMessage(error, "That number"), error.code === "23505" ? { no: "Already used by another work." } : undefined);
  // the photograph was replaced: the old files in storage are no longer needed
  if (before) {
    await removeMedia(supabase, [
      before.photo !== v.photo ? before.photo : null,
      before.photo_md !== v.photo_md ? before.photo_md : null,
      before.photo_thumb !== v.photo_thumb ? before.photo_thumb : null,
    ]);
  }
  publish();
  return done("Saved. The public site shows the change now.");
}

export async function deleteWork(id: string) {
  const { supabase } = await requireAdmin(true);
  const { data } = await supabase.from("works").select("photo,photo_md,photo_thumb").eq("id", id).maybeSingle();
  const { error } = await supabase.from("works").delete().eq("id", id);
  if (error) redirect(`/admin/works/${id}?error=delete`);
  if (data) await removeMedia(supabase, [data.photo, data.photo_md, data.photo_thumb]);
  publish();
  redirect("/admin/works?deleted=1");
}

/** show or hide a work on the public site */
export async function setWorkVisible(id: string, visible: boolean) {
  const { supabase } = await requireAdmin(true);
  await supabase.from("works").update({ visible }).eq("id", id);
  publish();
  redirect("/admin/works");
}

/** move a work one place up or down inside its series */
export async function moveWork(id: string, dir: -1 | 1) {
  const { supabase } = await requireAdmin(true);
  const { data: me } = await supabase.from("works").select("series_id").eq("id", id).maybeSingle();
  if (me && (await moveRow(supabase, "works", id, dir, { column: "series_id", value: me.series_id }))) publish();
  redirect("/admin/works");
}
