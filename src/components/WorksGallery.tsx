"use client";

import { useCallback, useMemo, useState } from "react";
import { series } from "@/data/series";
import { selected, works, type SeriesId, type Work } from "@/data/works";
import Plate from "./Plate";
import Lightbox from "./Lightbox";

/** The works in a masonry grid. With no props it has a filter per series; `seriesId` shows one series (two columns). */
export default function WorksGallery({ only, seriesId }: { only?: "selected"; seriesId?: SeriesId }) {
  const [filter, setFilter] = useState<"all" | SeriesId>("all");
  const [open, setOpen] = useState<number | null>(null);

  const base: Work[] = only === "selected" ? selected : seriesId ? works.filter((w) => w.series === seriesId) : works;
  const list = useMemo(() => (filter === "all" ? base : base.filter((w) => w.series === filter)), [filter, base]);
  const count = (id: "all" | SeriesId) => (id === "all" ? works.length : works.filter((w) => w.series === id).length);
  const close = useCallback(() => setOpen(null), []);
  const chips: { id: "all" | SeriesId; label: string }[] = [{ id: "all", label: "All works" }, ...series.map((s) => ({ id: s.id, label: s.title }))];

  return (
    <>
      {!only && !seriesId && (
        <div role="group" aria-label="Filter works" className="flex flex-wrap gap-x-5 gap-y-1 border-b border-line pb-3.5">
          {chips.map((g) => (
            <button
              key={g.id}
              type="button"
              aria-pressed={filter === g.id}
              onClick={() => setFilter(g.id)}
              className="relative py-1.5 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-3 transition-colors aria-pressed:text-ink aria-pressed:after:absolute aria-pressed:after:inset-x-0 aria-pressed:after:-bottom-[15px] aria-pressed:after:h-0.5 aria-pressed:after:bg-seal"
            >
              {g.label}
              <sup className="ml-0.5 text-[0.6rem]">{count(g.id)}</sup>
            </button>
          ))}
        </div>
      )}

      <div
        key={filter}
        className={`${only || seriesId ? "" : "mt-[clamp(28px,3.5vw,48px)]"} columns-1 gap-x-[clamp(20px,3vw,52px)] sm:columns-2 ${seriesId ? "" : "lg:columns-3"}`}
      >
        {list.map((w, i) => (
          <div
            key={w.no}
            style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
            className="mb-[clamp(36px,5vw,72px)] break-inside-avoid animate-rise"
          >
            <Plate work={w} onOpen={() => setOpen(i)} />
          </div>
        ))}
      </div>

      {open !== null && <Lightbox items={list} index={open} onClose={close} onIndex={setOpen} />}
    </>
  );
}
