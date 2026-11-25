import type { Metadata } from "next";
import PostRows from "@/components/PostRows";
import { PageHead, Wrap } from "@/components/ui";
import { getContent } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Journal",
  description: "Short essays on the artists and scripts behind calligraphy and the thinking behind the work.",
};

export default async function JournalPage() {
  const { posts } = await getContent();
  return (
    <>
      <PageHead no="03" label="Journal" title={["Notes on", <em key="e" className="font-light text-ink-2">script and masters</em>]}>
        <p className="m-0">Short writing on the artists and styles that shape how I see.</p>
      </PageHead>
      <section className="pb-[clamp(72px,10vw,150px)]">
        <Wrap>{posts.length ? <PostRows items={posts} /> : <p className="m-0 text-ink-2">Nothing has been published yet.</p>}</Wrap>
      </section>
    </>
  );
}
