"use server";

import { redirect } from "next/navigation";
import { guardAction, requireAdmin } from "@/lib/admin/auth";
import { moveRow, nextPosition } from "@/lib/admin/order";
import { publish } from "@/lib/admin/publish";
import { type ActionState, dbMessage, done, fail } from "@/lib/admin/result";
import { fieldErrors, flag, jsonList, seriesSchema, text } from "@/lib/admin/schemas";

const parse = (fd: FormData) =>
  seriesSchema.safeParse({
    title: text(fd, "title"),
    slug: text(fd, "slug"),
    kind: text(fd, "kind"),
    medium: text(fd, "medium"),
    statement: jsonList(fd, "statement").map((x) => (typeof x === "string" ? x : "")),
    cover_work_id: text(fd, "cover_work_id"),
    visible: flag(fd, "visible"),
  });

/** create (id = null) or update a series */
export async function saveSeries(id: string | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const gate = await guardAction();
  if (!gate.ok) return gate.state;
  const { supabase } = gate.admin;
  const parsed = parse(fd);
  if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrors(parsed.error));
  const v = parsed.data;

  if (!id) {
    const { data, error } = await supabase
      .from("series")
      .insert({ ...v, cover_work_id: null, position: await nextPosition(supabase, "series") })
      .select("id")
      .single();
    if (error || !data) return fail(dbMessage(error, "That address name"), error?.code === "23505" ? { slug: "Already used by another series." } : undefined);
    publish();
    redirect(`/admin/series/${data.id}?saved=1`);
  }

  // the cover must be one of this series' own works
  if (v.cover_work_id) {
    const { data: own } = await supabase.from("works").select("id").eq("id", v.cover_work_id).eq("series_id", id).maybeSingle();
    if (!own) return fail("The cover must be a work of this series.", { cover_work_id: "Choose one of this series' works." });
  }
  const { error } = await supabase.from("series").update(v).eq("id", id);
  if (error) return fail(dbMessage(error, "That address name"), error.code === "23505" ? { slug: "Already used by another series." } : undefined);
  publish();
  return done("Saved. The public site shows the change now.");
}

export async function deleteSeries(id: string) {
  const { supabase } = await requireAdmin(true);
  const { count } = await supabase.from("works").select("id", { count: "exact", head: true }).eq("series_id", id);
  if ((count ?? 0) > 0) redirect(`/admin/series/${id}?error=has-works`);
  const { error } = await supabase.from("series").delete().eq("id", id);
  if (error) redirect(`/admin/series/${id}?error=delete`);
  publish();
  redirect("/admin/series?deleted=1");
}

export async function moveSeries(id: string, dir: -1 | 1) {
  const { supabase } = await requireAdmin(true);
  if (await moveRow(supabase, "series", id, dir)) publish();
  redirect("/admin/series");
}
