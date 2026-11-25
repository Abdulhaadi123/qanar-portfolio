import Link from "next/link";
import { Badge, Empty, FlashBanner, LinkBtn, PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { formatDate } from "@/lib/content/helpers";

export const metadata = { title: "Journal" };

export default async function JournalList({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string; error?: string }> }) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const { data } = await supabase.from("journal_posts").select("id,slug,title,category,published_on,published,dek").order("published_on", { ascending: false });
  const rows = data ?? [];

  return (
    <>
      <PageTitle title="Journal" note="Short writing on the Journal page. A draft is saved here but not shown to visitors.">
        <LinkBtn href="/admin/journal/new" solid>
          + Write a post
        </LinkBtn>
      </PageTitle>
      <FlashBanner params={params} />
      {rows.length === 0 ? (
        <Empty>No posts yet.</Empty>
      ) : (
        <ul className="m-0 flex list-none flex-col border-t border-line-strong p-0">
          {rows.map((p) => (
            <li key={p.id} className="border-b border-line">
              <Link href={`/admin/journal/${p.id}`} className="group flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
                <span className="min-w-0 flex-1 basis-[280px]">
                  <span className="block font-display text-[1.25rem] tracking-[-0.01em] group-hover:text-seal">{p.title}</span>
                  <span className="block text-[0.86rem] text-ink-3">
                    {[p.category, formatDate(p.published_on)].filter(Boolean).join(" · ")}
                  </span>
                </span>
                {p.published ? <Badge tone="ok">Published</Badge> : <Badge tone="warn">Draft</Badge>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
