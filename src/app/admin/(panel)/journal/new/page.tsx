import { LinkBtn, PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { savePost } from "../../../actions/journal";
import PostForm from "../PostForm";

export const metadata = { title: "Write a post" };

export default async function NewPost() {
  await requireAdmin();
  return (
    <>
      <PageTitle title="Write a post">
        <LinkBtn href="/admin/journal">← All posts</LinkBtn>
      </PageTitle>
      <PostForm today={new Date().toISOString().slice(0, 10)} action={savePost.bind(null, null)} />
    </>
  );
}
