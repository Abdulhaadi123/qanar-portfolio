"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { mediumOf, selected } from "@/data/works";
import { seriesById } from "@/data/series";
import type { ArcHandle } from "./ArcGallery";
import Lightbox from "./Lightbox";
import { Label } from "./ui";

const ArcGallery = dynamic(() => import("./ArcGallery"), { ssr: false });

/**
 * Home page: the selected works on a turning 3D arc.
 * Until WebGL is ready (and if it never is) a plain sideways strip of the same photographs is shown,
 * in the same box, so nothing jumps.
 */
export default function SelectedArc() {
  const handle = useRef<ArcHandle | null>(null);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const w = selected[active];
  const s = seriesById(w.series);

  const btn =
    "grid size-12 place-items-center border border-ink font-mono text-[0.95rem] transition-colors duration-300 hover:bg-ink hover:text-paper";

  return (
    <>
      <div className="relative h-[min(78svh,720px)] min-h-[440px]">
        {/* the strip: first paint, no-JS, no-WebGL */}
        <div
          className={`absolute inset-0 flex items-center gap-6 overflow-x-auto px-gutter transition-opacity duration-700 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            ready ? "pointer-events-none opacity-0" : ""
          }`}
        >
          {selected.map((x, i) => (
            <button key={x.no} type="button" onClick={() => setOpen(i)} className="h-[78%] shrink-0 cursor-zoom-in" aria-label={`Open ${x.title}, no. ${x.no}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={x.photo} alt={`${x.title}, ${mediumOf(x)}, ${x.size}`} loading={i < 3 ? "eager" : "lazy"} className="h-full w-auto shadow-[0_14px_22px_rgba(70,50,30,0.22)]" />
            </button>
          ))}
        </div>
        <ArcGallery items={selected} handle={handle} onActive={setActive} onOpen={setOpen} onReady={() => setReady(true)} />
      </div>

      <div className="mt-6 grid grid-cols-1 items-end gap-x-8 gap-y-5 border-t border-line-strong pt-5 md:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <p key={w.no} className="m-0 animate-fade font-display text-[clamp(1.5rem,2.4vw,2.2rem)] tracking-[-0.02em]">
            {w.title} <span className="text-ink-3">· No. {w.no}</span>
          </p>
          <p className="m-0 mt-1 text-[0.95rem] text-ink-2">
            {s.title} · {mediumOf(w)} · {w.size}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Label className="mr-3 hidden sm:block">Drag, or use the arrows</Label>
          <button type="button" className={btn} aria-label="Previous work" onClick={() => handle.current?.go(-1)}>
            ←
          </button>
          <button type="button" className={btn} aria-label="Next work" onClick={() => handle.current?.go(1)}>
            →
          </button>
          <button
            type="button"
            onClick={() => setOpen(active)}
            className="h-12 border border-ink bg-ink px-5 font-mono text-[0.74rem] uppercase tracking-[0.1em] text-paper transition-colors duration-300 hover:border-seal hover:bg-seal"
          >
            Open
          </button>
        </div>
      </div>

      {open !== null && <Lightbox items={selected} index={open} onClose={close} onIndex={setOpen} />}
    </>
  );
}
