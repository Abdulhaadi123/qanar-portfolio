"use client";

import { useEffect, useRef } from "react";
import { hasSize, mediumOf, priceLabel, seriesById } from "@/lib/content/helpers";
import type { Series, Work } from "@/lib/content/types";
import Photo from "./Photo";
import Wall from "./Wall";
import { Btn, Label } from "./ui";

/** One work, large, with its details and its size on a wall. Esc closes, ← → move on. */
export default function Lightbox({
  items,
  series,
  total,
  index,
  onClose,
  onIndex,
}: {
  items: Work[];
  series: Series[];
  /** how many works the portfolio has in all (for "No. 06 / 39") */
  total: number;
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const work = items[index];
  const closeBtn = useRef<HTMLButtonElement>(null);
  const s = seriesById(series, work.series);

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % items.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      prevFocus?.focus?.();
    };
  }, [index, items.length, onClose, onIndex]);

  const row = "flex justify-between gap-5 border-b border-line py-2.5";
  const dt = "font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-3";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${work.title}, no. ${work.no}`}
      className="fixed inset-0 z-90 grid animate-fade grid-cols-1 gap-8 overflow-auto bg-paper/95 px-gutter pb-8 pt-[clamp(64px,8vh,92px)] backdrop-blur-sm lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] lg:gap-[clamp(24px,4vw,72px)]"
    >
      <button
        ref={closeBtn}
        type="button"
        onClick={onClose}
        className="fixed right-gutter top-4 z-10 border border-ink bg-paper px-4 py-2.5 font-mono text-[0.72rem] uppercase tracking-[0.1em] transition-colors hover:bg-ink hover:text-paper"
      >
        Close ✕
      </button>

      <div className="grid min-h-0 min-w-0 place-items-center" onClick={onClose}>
        <div
          key={work.no}
          onClick={(e) => e.stopPropagation()}
          style={{ width: `min(100%, calc((100svh - 190px) * ${work.ratio}))` }}
          className="animate-rise shadow-[0_26px_40px_rgba(70,50,30,0.28)]"
        >
          <Photo src={work.photo} ratio={work.ratio} blur={work.blur} alt={`${work.title}, ${mediumOf(work)}, ${work.size}`} eager />
        </div>
      </div>

      <aside className="flex flex-col gap-5 self-start lg:self-center">
        <Label>
          No. <b className="text-ink">{work.no}</b> / {String(total).padStart(2, "0")}
        </Label>
        <h2 className="m-0 font-display text-[clamp(2rem,3.4vw,3rem)] font-[340] leading-none tracking-[-0.03em]">{work.title}</h2>
        <dl className="m-0 border-t border-line-strong">
          {s && (
            <div className={row}>
              <dt className={dt}>Series</dt>
              <dd className="m-0 text-right">
                {s.kind} · {s.title}
              </dd>
            </div>
          )}
          {work.year !== null && (
            <div className={row}>
              <dt className={dt}>Year</dt>
              <dd className="m-0 text-right">{work.year}</dd>
            </div>
          )}
          <div className={row}>
            <dt className={dt}>Size</dt>
            <dd className="m-0 text-right">{work.size || "Not listed"}</dd>
          </div>
          <div className={row}>
            <dt className={dt}>Medium</dt>
            <dd className="m-0 text-right">{mediumOf(work)}</dd>
          </div>
          <div className={row}>
            <dt className={dt}>Price</dt>
            <dd className="m-0 text-right">{priceLabel(work)}</dd>
          </div>
          {work.note && (
            <div className={row}>
              <dt className={dt}>Note</dt>
              <dd className="m-0 text-right">{work.note}</dd>
            </div>
          )}
        </dl>
        {hasSize(work) && <Wall work={work} />}
        <div className="flex flex-wrap items-center gap-3">
          <Btn href={`/contact?work=${work.no}`} solid>
            Enquire about this work
          </Btn>
          <button
            type="button"
            aria-label="Previous work"
            onClick={() => onIndex((index - 1 + items.length) % items.length)}
            className="border border-ink px-5 py-[0.8em] font-mono text-[0.8rem] transition-colors hover:bg-ink hover:text-paper"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next work"
            onClick={() => onIndex((index + 1) % items.length)}
            className="border border-ink px-5 py-[0.8em] font-mono text-[0.8rem] transition-colors hover:bg-ink hover:text-paper"
          >
            →
          </button>
        </div>
      </aside>
    </div>
  );
}

