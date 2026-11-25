import Link from "next/link";
import AdminNav, { type NavGroup } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/admin/auth";
import { signOut } from "../actions/auth";

/** The frame around every admin page. It also checks the visitor really is the admin (the page itself checks again next to its data). */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireAdmin();
  const { count } = await supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new");

  const groups: NavGroup[] = [
    { title: "Overview", items: [{ href: "/admin", label: "Dashboard" }] },
    {
      title: "Portfolio",
      items: [
        { href: "/admin/works", label: "Works" },
        { href: "/admin/series", label: "Series" },
        { href: "/admin/journal", label: "Journal" },
      ],
    },
    {
      title: "Words and pictures",
      items: [
        { href: "/admin/site", label: "Contact & identity" },
        { href: "/admin/home", label: "Home & footer" },
        { href: "/admin/about", label: "About & teaching" },
        { href: "/admin/record", label: "Exhibitions & record" },
        { href: "/admin/images", label: "Hero & portrait" },
      ],
    },
    {
      title: "Messages",
      items: [{ href: "/admin/enquiries", label: "Enquiries", badge: count ?? 0 }],
    },
    { title: "You", items: [{ href: "/admin/account", label: "Password" }] },
  ];

  const bottom = (
    <div className="flex flex-col gap-3 border-t border-line-strong pt-5">
      <Link href="/" target="_blank" className="font-mono text-[0.7rem] uppercase tracking-[0.1em] underline decoration-line-strong underline-offset-4 hover:text-seal">
        View the live site ↗
      </Link>
      <p className="m-0 truncate text-[0.82rem] text-ink-3" title={user.email}>
        {user.email}
      </p>
      <form action={signOut}>
        <button type="submit" className="border border-ink px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.1em] transition-colors hover:bg-ink hover:text-paper">
          Sign out
        </button>
      </form>
    </div>
  );

  return (
    <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* phone: a menu that opens on tap */}
      <details className="group sticky top-0 z-20 border-b border-line-strong bg-paper lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 [&::-webkit-details-marker]:hidden">
          <span className="font-display text-[1.2rem]">Studio admin</span>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] group-open:hidden">Menu</span>
          <span className="hidden font-mono text-[0.7rem] uppercase tracking-[0.1em] group-open:inline">Close</span>
        </summary>
        <div className="max-h-[80svh] overflow-y-auto px-5 pb-6 pt-2">
          <AdminNav groups={groups} />
          <div className="mt-6">{bottom}</div>
        </div>
      </details>

      {/* desktop: a fixed side bar */}
      <aside className="hidden border-r border-line-strong lg:block">
        <div className="sticky top-0 flex h-svh flex-col gap-8 overflow-y-auto px-5 py-8">
          <div>
            <p lang="ur" dir="rtl" className="m-0 font-script text-[2rem] leading-none text-seal">
              قمر
            </p>
            <p className="m-0 mt-1 font-display text-[1.25rem] tracking-[-0.01em]">Studio admin</p>
          </div>
          <AdminNav groups={groups} />
          <div className="mt-auto">{bottom}</div>
        </div>
      </aside>

      <main id="main" className="min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-[980px]">{children}</div>
      </main>
    </div>
  );
}
