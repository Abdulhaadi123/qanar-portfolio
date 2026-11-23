import Link from "next/link";
import { series } from "@/data/series";
import { worksByNo, worksOf } from "@/data/works";
import Photo from "./Photo";
import { Label, R } from "./ui";

/** The four series: big type on ruled rows, with the first lines of his statement and a cover photograph. */
export default function SeriesList() {
  return (
    <div className="border-t border-line-strong">
      {series.map((s, i) => {
        const cover = worksByNo(s.cover)!;
        return (
          <R key={s.slug} delay={i * 80}>
            <Link
              href={`/works#${s.slug}`}
              className="group/row grid grid-cols-[40px_minmax(0,1fr)_92px] items-center gap-x-5 gap-y-3 border-b border-line py-[clamp(22px,2.8vw,36px)] transition-[padding,background-color] duration-500 ease-expo hover:bg-paper-2/70 hover:px-3.5 md:grid-cols-[56px_minmax(0,1.1fr)_minmax(0,1fr)_clamp(110px,12vw,170px)]"
            >
              <span className="font-mono text-[0.78rem] text-ink-3">{s.no}</span>
              <div>
                <h3 className="m-0 font-display text-[clamp(1.7rem,3.6vw,3.3rem)] font-[340] leading-[1.02] tracking-[-0.028em]">{s.title}</h3>
                <Label className="mt-3">
                  {s.kind} · {worksOf(s.id).length} works
                </Label>
              </div>
              <div className="col-start-2 row-start-2 md:col-start-3 md:row-start-1">
                <Label className="text-ink">{s.medium}</Label>
                <p className="m-0 mt-2 line-clamp-3 max-w-[46ch] text-[0.98rem] text-ink-2">{s.statement[0]}</p>
              </div>
              <div className="col-start-3 row-span-2 row-start-1 overflow-hidden md:col-start-4 md:row-span-1">
                <div className="transition-transform duration-[900ms] ease-expo group-hover/row:scale-[1.07]">
                  <Photo src={cover.photo} ratio={0.8} alt={`${s.title}: ${cover.title}`} />
                </div>
              </div>
            </Link>
          </R>
        );
      })}
    </div>
  );
}
