"use client";

import Link from "next/link";
import { series } from "@/data/site";
import type { PlateStyle } from "@/lib/plates";
import PlateCanvas from "./PlateCanvas";
import { Label, R } from "./ui";

/** each body of work is drawn in its own medium (see src/lib/plates.ts) */
const look: Record<string, { style: PlateStyle; seed: number; photo: string }> = {
  "echoes-on-birch": { style: "birch", seed: 411, photo: "/works/series-birch.webp" },
  "constitution-and-currency": { style: "currency", seed: 149, photo: "/works/series-currency.webp" },
  "needle-and-thread": { style: "embroidery", seed: 66, photo: "/works/series-embroidery.webp" },
};

/** The three bodies of work: big type on ruled rows, with a small plate each. */
export default function SeriesList() {
  return (
    <div className="border-t border-line-strong">
      {series.map((s, i) => (
        <R key={s.slug} delay={i * 80}>
          <Link
            href={`/works#${s.slug}`}
            className="group/row grid grid-cols-[40px_minmax(0,1fr)_84px] items-center gap-x-5 gap-y-3 border-b border-line py-[clamp(22px,2.8vw,36px)] transition-[padding,background-color] duration-500 ease-expo hover:bg-paper-2/70 hover:px-3.5 md:grid-cols-[56px_minmax(0,1.2fr)_minmax(0,1fr)_clamp(96px,11vw,150px)]"
          >
            <span className="font-mono text-[0.78rem] text-ink-3">{s.no}</span>
            <div>
              <h3 className="m-0 font-display text-[clamp(1.7rem,3.6vw,3.3rem)] font-[340] leading-[1.02] tracking-[-0.028em]">{s.title}</h3>
              <Label className="mt-3">{s.kind}</Label>
            </div>
            <div className="col-start-2 row-start-2 md:col-start-3 md:row-start-1">
              <Label className="text-ink">{s.medium}</Label>
              <p className="m-0 mt-2 max-w-[44ch] text-[0.98rem] text-ink-2">{s.text}</p>
            </div>
            <div className="col-start-3 row-span-2 row-start-1 overflow-hidden md:col-start-4 md:row-span-1">
              <div className="transition-transform duration-[900ms] ease-expo group-hover/row:scale-[1.07]">
                <PlateCanvas style={look[s.slug].style} seed={look[s.slug].seed} photo={look[s.slug].photo} ratio={0.8} alt={`${s.title}, drawn in its medium`} maxW={320} />
              </div>
            </div>
          </Link>
        </R>
      ))}
    </div>
  );
}
