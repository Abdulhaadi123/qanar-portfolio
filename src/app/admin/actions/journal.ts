"use server";

import { redirect } from "next/navigation";
import { guardAction, requireAdmin } from "@/lib/admin/auth";
import { publish } from "@/lib/admin/publish";
import { type ActionState, dbMessage, done, fail } from "@/lib/admin/result";
import { fieldErrors, flag, jsonList, postSchema, slugOf, text } from "@/lib/admin/schemas";
import { readMinutes } from "@/lib/content/helpers";
import type { PostBlock } from "@/lib/content/types";

/** create (id = null) or update a journal post */
export async function savePost(id: string | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const gate = await guardAction();
  if (!gate.ok) return gate.state;
  const { supabase } = gate.admin;
  const parsed = postSchema.safeParse({
    title: text(fd, "title"),
    slug: text(fd, "slug") || slugOf(text(fd, "title")),
    category: text(fd, "category"),
    published_on: text(fd, "published_on"),
    dek: text(fd, "dek"),
    body: jsonList(fd, "body").filter((x) => typeof x === "object" && x !== null),
    published: flag(fd, "published"),
  });
  if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrors(parsed.error));
  const { body, ...rest } = parsed.data;
  const blocks: PostBlock[] = body.map((b) => (b.type === "h" ? { h: b.text } : b.type === "quote" ? { quote: b.text } : { p: b.text }));
  if (rest.published && blocks.length === 0) return fail("Write something before you publish.", { body: "Add at least one paragraph." });
  const row = { ...rest, body: blocks, read_minutes: readMinutes(blocks) };

  if (!id) {
    const { data, error } = await supabase.from("journal_posts").insert(row).select("id").single();
    if (error || !data) return fail(dbMessage(error, "That address name"), error?.code === "23505" ? { slug: "Already used by another post." } : undefined);
    publish();
    redirect(`/admin/journal/${data.id}?saved=1`);
  }
  const { error } = await supabase.from("journal_posts").update(row).eq("id", id);
  if (error) return fail(dbMessage(error, "That address name"), error.code === "23505" ? { slug: "Already used by another post." } : undefined);
  publish();
  return done(rest.published ? "Saved. The post is live." : "Saved as a draft. It is not shown on the public site.");
}

export async function deletePost(id: string) {
  const { supabase } = await requireAdmin(true);
  const { error } = await supabase.from("journal_posts").delete().eq("id", id);
  if (error) redirect(`/admin/journal/${id}?error=delete`);
  publish();
  redirect("/admin/journal?deleted=1");
}
