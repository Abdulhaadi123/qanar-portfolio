"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { hasSize, mediumOf, priceLabel } from "@/lib/content/helpers";
import type { Series, SeriesId, Work } from "@/lib/content/types";
import Wall, { FIG } from "./Wall";
import { Btn, Label } from "./ui";

/** The list of works beside a wall that shows the chosen one at its real size. */
export default function ScaleWall({ works, series }: { works: Work[]; series: Series[] }) {
  const sized = useMemo(() => works.filter(hasSize), [works]);
  const [filter, setFilter] = useState<"all" | SeriesId>("all");
  const [active, setActive] = useState(sized[0]?.no ?? "");
  const [touched, setTouched] = useState(false);
  const [inView, setInView] = useState(false);
  const wallBox = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const list = useMemo(() => (filter === "all" ? sized : sized.filter((w) => w.series === filter)), [filter, sized]);
  const work = list.find((w) => w.no === active) ?? list[0];
  const count = (id: "all" | SeriesId) => (id === "all" ? sized.length : sized.filter((w) => w.series === id).length);

  useEffect(() => {
    const el = wallBox.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // walk through the works until the visitor takes over
  useEffect(() => {
    if (touched || !inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      setActive((cur) => {
        const i = list.findIndex((w) => w.no === cur);
        return list[(i + 1) % list.length].no;
      });
    }, 2800);
    return () => clearInterval(t);
  }, [touched, inView, list]);

  const choose = (no: string) => {
    setTouched(true);
    setActive(no);
  };

  const onKey = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const i = list.findIndex((w) => w.no === work.no);
    const next = list[(i + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length];
    choose(next.no);
    listRef.current?.querySelector<HTMLButtonElement>(`[data-no="${next.no}"]`)?.focus();
  };

  // only series that have a work with a fixed size get a filter
  const chips: { id: "all" | SeriesId; label: string }[] = [
    { id: "all", label: "All" },
    ...series.filter((s) => sized.some((w) => w.series === s.id)).map((s) => ({ id: s.id, label: s.title })),
  ];

  if (!work) return null;

  return (
    <div className="grid grid-cols-1 gap-x-[clamp(32px,5vw,96px)] gap-y-10 lg:grid-cols-12">
      <div className="order-2 lg:order-1 lg:col-span-6">
        <div role="group" aria-label="Filter works" className="mb-2 flex flex-wrap gap-x-5 gap-y-1 pb-3">
          {chips.map((g) => (
            <button
              key={g.id}
              type="button"
              aria-pressed={filter === g.id}
              onClick={() => {
                setFilter(g.id);
                choose((g.id === "all" ? sized : sized.filter((x) => x.series === g.id))[0].no);
              }}
              className="relative py-1.5 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-3 transition-colors aria-pressed:text-ink aria-pressed:after:absolute aria-pressed:after:inset-x-0 aria-pressed:after:-bottom-0.5 aria-pressed:after:h-0.5 aria-pressed:after:bg-seal"
            >
              {g.label}
              <sup className="ml-0.5 text-[0.6rem]">{count(g.id)}</sup>
            </button>
          ))}
        </div>
        <ul ref={listRef} onKeyDown={onKey} className="m-0 max-h-[640px] list-none overflow-y-auto border-t border-line-strong p-0">
          {list.map((x) => (
            <li key={x.no}>
              <button
                type="button"
                data-no={x.no}
                aria-current={x.no === work.no}
                onMouseEnter={() => window.matchMedia("(hover: hover)").matches && choose(x.no)}
                onFocus={() => choose(x.no)}
                onClick={() => {
                  choose(x.no);
                  if (window.innerWidth < 1024) wallBox.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="group/row grid w-full grid-cols-[40px_minmax(0,1fr)_auto] items-baseline gap-x-4 border-b border-l-2 border-b-line border-l-transparent py-3 pl-2 pr-1 text-left transition-[background-color,border-color,padding] duration-300 hover:bg-paper-2/70 aria-[current=true]:border-l-seal aria-[current=true]:bg-paper-2 aria-[current=true]:pl-4"
              >
                <span className="font-mono text-[0.78rem] text-ink-3 group-aria-[current=true]/row:text-ink">{x.no}</span>
                <span className="min-w-0">
                  <span className="block font-display text-[1.15rem] tracking-[-0.01em]">{x.title}</span>
                  <span className="block truncate font-mono text-[0.66rem] uppercase tracking-[0.08em] text-ink-3">{mediumOf(x)}</span>
                </span>
                <span className="whitespace-nowrap font-mono text-[0.78rem] text-ink-2">{x.size}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="order-1 lg:order-2 lg:col-span-6">
        <div className="lg:sticky lg:top-[calc(var(--spacing-head)+24px)]">
          <div ref={wallBox}>
            <Wall work={work} />
          </div>
          <div className="mt-6 border-t border-line-strong pt-4">
            <div className="flex items-baseline justify-between gap-4">
              <p key={work.no} className="m-0 animate-fade font-display text-[1.5rem] tracking-[-0.02em]">
                No. {work.no} <span className="text-ink-3">· {work.title}</span>
              </p>
              <Label>{priceLabel(work) === "On request" ? "Price on request" : priceLabel(work)}</Label>
            </div>
            <p className="m-0 mt-1 text-[0.95rem] text-ink-2">
              {mediumOf(work)} · {work.size}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Btn href={`/contact?work=${work.no}`}>Enquire about this work</Btn>
              <Label className="max-w-[30ch] normal-case tracking-[0.04em]">Shown at true size beside a {FIG} cm figure.</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
