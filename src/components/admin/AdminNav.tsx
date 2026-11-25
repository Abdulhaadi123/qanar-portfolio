"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavGroup {
  title: string;
  items: { href: string; label: string; badge?: number }[];
}

/** The side navigation; the page you are on is marked. */
export default function AdminNav({ groups }: { groups: NavGroup[] }) {
  const path = usePathname();
  const on = (href: string) => (href === "/admin" ? path === "/admin" : path === href || path.startsWith(`${href}/`));
  return (
    <nav aria-label="Admin" className="flex flex-col gap-6">
      {groups.map((g) => (
        <div key={g.title}>
          <p className="m-0 mb-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-3">{g.title}</p>
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            {g.items.map((i) => (
              <li key={i.href}>
                <Link
                  href={i.href}
                  aria-current={on(i.href) ? "page" : undefined}
                  className="flex items-center justify-between gap-3 border-l-2 border-transparent px-3 py-2 text-[0.98rem] transition-colors hover:bg-paper-2 aria-[current=page]:border-seal aria-[current=page]:bg-paper-2 aria-[current=page]:font-medium"
                >
                  <span>{i.label}</span>
                  {i.badge ? <span className="min-w-5 bg-seal px-1.5 text-center font-mono text-[0.64rem] leading-5 text-paper">{i.badge}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
