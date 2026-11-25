import { notFound } from "next/navigation";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { Card, FlashBanner, LinkBtn, PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { deletePost, savePost } from "../../../actions/journal";
import PostForm, { type PostRow } from "../PostForm";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const metadata = { title: "Edit post" };

export default async function EditPost({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("journal_posts").select("id,slug,title,category,published_on,dek,body,published").eq("id", id).maybeSingle();
  if (!data) notFound();
  const post = data as PostRow;

  return (
    <>
      <PageTitle title={post.title}>
        <LinkBtn href="/admin/journal">← All posts</LinkBtn>
        {post.published ? <LinkBtn href={`/journal/${post.slug}`}>See it on the site ↗</LinkBtn> : null}
      </PageTitle>
      <FlashBanner params={await searchParams} />
      <PostForm post={post} today="" action={savePost.bind(null, id)} />
      <Card title="Delete this post" className="mt-8" note="This removes the post for good. To keep it but hide it, untick “Published”.">
        <ConfirmButton action={deletePost.bind(null, id)} label="Delete this post…" confirmLabel="Yes, delete it for good" question={`Delete “${post.title}”?`} />
      </Card>
    </>
  );
}
