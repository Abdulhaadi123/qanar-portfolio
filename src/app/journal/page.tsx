import type { Metadata } from "next";
import PostRows from "@/components/PostRows";
import { PageHead, Wrap } from "@/components/ui";

export const metadata: Metadata = {
  title: "Journal",
  description: "Short essays on the artists and scripts behind calligraphy: Sadequain, Nastaliq, Ibn Muqla.",
};

export default function JournalPage() {
  return (
    <>
      <PageHead no="03" label="Journal" title={["Notes on", <em key="e" className="font-light text-ink-2">script and masters</em>]}>
        <p className="m-0">Short writing on the artists and styles that shape how I see.</p>
      </PageHead>
      <section className="pb-[clamp(72px,10vw,150px)]">
        <Wrap>
          <PostRows />
        </Wrap>
      </section>
    </>
  );
}
