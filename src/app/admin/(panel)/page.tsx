import Link from "next/link";
import { Badge, Card, Empty, LinkBtn, PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata = { title: "Dashboard" };

const count = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;

const ago = (iso: string) => {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 90) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

/** a thin bar: how much of the portfolio has this filled in */
function Progress({ label, done, total, href }: { label: string; done: number; total: number; href: string }) {
  const pct = total ? Math.round((done / total) * 100) : 100;
  return (
    <li>
      <Link href={href} className="group block">
        <span className="flex items-baseline justify-between gap-3 text-[0.95rem]">
          <span className="group-hover:text-seal">{label}</span>
          <span className="font-mono text-[0.7rem] tracking-[0.06em] text-ink-3">
            {done} of {total}
          </span>
        </span>
        <span className="mt-1.5 block h-1.5 bg-line" aria-hidden>
          <span className="block h-full bg-ink transition-[width] duration-700" style={{ width: `${pct}%` }} />
        </span>
      </Link>
    </li>
  );
}

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const head = { count: "exact", head: true } as const;
  const [works, hidden, series, posts, drafts, fresh, all, untitled, noMedium, noYear, noPrice, recent, changed] = await Promise.all([
    count(supabase.from("works").select("id", head)),
    count(supabase.from("works").select("id", head).eq("visible", false)),
    count(supabase.from("series").select("id", head)),
    count(supabase.from("journal_posts").select("id", head).eq("published", true)),
    count(supabase.from("journal_posts").select("id", head).eq("published", false)),
    count(supabase.from("enquiries").select("id", head).eq("status", "new")),
    count(supabase.from("enquiries").select("id", head)),
    count(supabase.from("works").select("id", head).eq("title", "Untitled")),
    count(supabase.from("works").select("id", head).eq("medium", "")),
    count(supabase.from("works").select("id", head).is("year", null)),
    count(supabase.from("works").select("id", head).eq("price", "")),
    supabase.from("enquiries").select("id,created_at,name,kind,status,message").order("created_at", { ascending: false }).limit(5),
    supabase.from("works").select("id,no,title,photo_thumb,updated_at").order("updated_at", { ascending: false }).limit(5),
  ]);

  const tile = "flex flex-col gap-1 border border-line-strong bg-paper-2/40 p-5 transition-colors hover:bg-paper-2";
  const big = "font-display text-[2.6rem] font-[320] leading-none tracking-[-0.03em]";
  const rows = recent.data ?? [];
  const edits = changed.data ?? [];

  return (
    <>
      <PageTitle title="Dashboard" note="Everything you change here appears on the public site straight away.">
        <LinkBtn href="/admin/works/new" solid>
          + Add a work
        </LinkBtn>
        <LinkBtn href="/admin/journal/new">+ Write a post</LinkBtn>
      </PageTitle>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/works" className={tile}>
          <span className={big}>{works}</span>
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-2">Works</span>
          <span className="text-[0.86rem] text-ink-3">{hidden ? `${hidden} hidden` : "all visible"}</span>
        </Link>
        <Link href="/admin/series" className={tile}>
          <span className={big}>{series}</span>
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-2">Series</span>
          <span className="text-[0.86rem] text-ink-3">bodies of work</span>
        </Link>
        <Link href="/admin/journal" className={tile}>
          <span className={big}>{posts}</span>
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-2">Journal posts</span>
          <span className="text-[0.86rem] text-ink-3">{drafts ? `${drafts} draft${drafts === 1 ? "" : "s"}` : "all published"}</span>
        </Link>
        <Link href="/admin/enquiries" className={tile}>
          <span className={`${big} ${fresh ? "text-seal" : ""}`}>{fresh}</span>
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-2">New enquiries</span>
          <span className="text-[0.86rem] text-ink-3">{all} in all</span>
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card title="Still to fill in" note="Visitors see “Untitled” and “On request” until these are filled. Open a work to add them.">
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            <Progress label="Titles" done={works - untitled} total={works} href="/admin/works" />
            <Progress label="Medium" done={works - noMedium} total={works} href="/admin/works" />
            <Progress label="Year" done={works - noYear} total={works} href="/admin/works" />
            <Progress label="Price" done={works - noPrice} total={works} href="/admin/works" />
          </ul>
        </Card>

        <Card title="Changed lately">
          {edits.length === 0 ? (
            <Empty>Nothing yet.</Empty>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {edits.map((w) => (
                <li key={w.id}>
                  <Link href={`/admin/works/${w.id}`} className="group flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.photo_thumb} alt="" loading="lazy" className="h-12 w-10 shrink-0 border border-line bg-paper-2 object-contain" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-[1.02rem] group-hover:text-seal">
                        <span className="mr-2 font-mono text-[0.72rem] text-ink-3">{w.no}</span>
                        {w.title}
                      </span>
                      <span className="block font-mono text-[0.64rem] uppercase tracking-[0.08em] text-ink-3">{ago(w.updated_at)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card title="Latest messages" note="From the contact form on the site.">
          {rows.length === 0 ? (
            <Empty>No messages yet.</Empty>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {rows.map((m) => (
                <li key={m.id} className="border-b border-line py-3 first:pt-0 last:border-b-0 last:pb-0">
                  <Link href={`/admin/enquiries/${m.id}`} className="group flex flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-[1.1rem] group-hover:text-seal">{m.name}</span>
                      {m.status === "new" ? <Badge tone="warn">New</Badge> : null}
                      <span className="font-mono text-[0.66rem] uppercase tracking-[0.08em] text-ink-3">{ago(m.created_at)}</span>
                    </span>
                    <span className="line-clamp-2 text-[0.92rem] text-ink-2">{m.message}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Good to know">
          <ul className="m-0 flex list-none flex-col gap-3 p-0 text-[0.95rem] text-ink-2">
            <li>
              <b className="text-ink">Pictures</b> are shrunk in your browser before they are sent, so the site stays fast. Use the biggest original you have.
            </li>
            <li>
              <b className="text-ink">Hide</b> a work to take it off the site without deleting it. It stays here.
            </li>
            <li>
              <b className="text-ink">Backup:</b>{" "}
              <a href="/admin/export" className="underline decoration-line-strong underline-offset-4 hover:text-seal">
                download everything as a file
              </a>{" "}
              now and then.
            </li>
          </ul>
        </Card>
      </div>
    </>
  );
}
