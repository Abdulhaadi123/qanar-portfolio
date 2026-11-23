"use client";

import { useCallback, useMemo, useState } from "react";
import { groups, selected, works, type Group, type Work } from "@/data/works";
import Plate from "./Plate";
import Lightbox from "./Lightbox";

/** The plates in a masonry grid, with filters. `only="selected"` shows the six used on the home page. */
export default function WorksGallery({ only }: { only?: "selected" }) {
  const [filter, setFilter] = useState<"all" | Group>("all");
  const [open, setOpen] = useState<number | null>(null);

  const base: Work[] = only === "selected" ? selected : works;
  const list = useMemo(() => (filter === "all" ? base : base.filter((w) => w.group === filter)), [filter, base]);
  const count = (id: "all" | Group) => (id === "all" ? works.length : works.filter((w) => w.group === id).length);
  const close = useCallback(() => setOpen(null), []);

  return (
    <>
      {!only && (
        <div role="group" aria-label="Filter works" className="flex flex-wrap gap-x-5 gap-y-1 border-b border-line pb-3.5">
          {groups.map((g) => (
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
        className={`${only ? "" : "mt-[clamp(28px,3.5vw,48px)]"} columns-1 gap-x-[clamp(20px,3vw,52px)] sm:columns-2 lg:columns-3`}
      >
        {list.map((w, i) => (
          <div
            key={w.no}
            style={{ animationDelay: `${i * 45}ms` }}
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
