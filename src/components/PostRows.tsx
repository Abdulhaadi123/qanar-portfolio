import Link from "next/link";
import { posts, formatDate, type Post } from "@/data/journal";
import { Label, R } from "./ui";

export default function PostRows({ items = posts }: { items?: Post[] }) {
  return (
    <div className="border-t border-line-strong">
      {items.map((p, i) => (
        <R key={p.slug} delay={i * 70}>
          <Link
            href={`/journal/${p.slug}`}
            className="group/row grid grid-cols-1 items-baseline gap-x-7 gap-y-2 border-b border-line py-[clamp(22px,3vw,38px)] transition-[padding,background-color] duration-500 ease-expo hover:bg-paper-2/70 hover:px-3.5 md:grid-cols-[170px_minmax(0,1fr)_120px]"
          >
            <Label>
              {p.category} · {formatDate(p.date)}
            </Label>
            <div>
              <h3 className="m-0 font-display text-[clamp(1.5rem,2.6vw,2.4rem)] font-[340] leading-[1.1] tracking-[-0.02em]">{p.title}</h3>
              <p className="m-0 mt-2 max-w-[60ch] text-ink-2">{p.dek}</p>
            </div>
            <Label className="md:text-right">
              {p.read} <span className="inline-block transition-transform duration-300 group-hover/row:translate-x-1">→</span>
            </Label>
          </Link>
        </R>
      ))}
    </div>
  );
}
