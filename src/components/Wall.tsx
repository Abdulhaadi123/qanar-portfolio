"use client";

import { useRef, type PointerEvent } from "react";
import { cm, mediumOf, type Work } from "@/data/works";
import Photo from "./Photo";

/*
  A gallery wall drawn to scale: the work at its real size beside a 175 cm figure.
  Only for works with one fixed size (see hasSize in src/data/works.ts).
*/
export const WALL_W = 320; // cm across
const WALL_H = 240; // cm high (above the floor)
const FLOOR = 6; // % of the box taken by the floor strip
const CX = 214; // work centre, cm from the left edge
const CY = 150; // hanging height, cm above the floor
export const FIG = 175; // figure height, cm

const pctX = (v: number) => (v / WALL_W) * 100;
const pctY = (v: number) => (v / WALL_H) * (100 - FLOOR);

export default function Wall({ work, className = "" }: { work: Work; className?: string }) {
  const tilt = useRef<HTMLDivElement>(null);
  const w = work.wCm ?? 0;
  const h = work.hCm ?? 0;
  const left = pctX(CX - w / 2);
  const bottom = FLOOR + pctY(CY - h / 2);

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !tilt.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tilt.current.style.transform = `rotateY(${x * 9}deg) rotateX(${-y * 6}deg)`;
  };
  const leave = () => {
    if (tilt.current) tilt.current.style.transform = "";
  };

  return (
    <div onPointerMove={move} onPointerLeave={leave} className={`[perspective:1300px] ${className}`}>
      <div
        ref={tilt}
        className="relative aspect-[5/4] w-full transition-transform duration-500 ease-expo [transform-style:preserve-3d]"
      >
        {/* wall + floor */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#ece5d6_0%,#e3dac6_100%)]" />
        <div
          className="absolute inset-x-0 bottom-0 border-t border-ink/25 bg-[linear-gradient(180deg,#d3c8ae,#c9bd9f)]"
          style={{ height: `${FLOOR}%` }}
        />
        {/* hanging height */}
        <div className="absolute inset-x-0 border-t border-dashed border-ink/20" style={{ bottom: `${FLOOR + pctY(CY)}%` }}>
          <span className="absolute -top-4 right-2 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">{CY} cm</span>
        </div>

        {/* a 175 cm figure for scale */}
        <svg
          aria-hidden
          viewBox="0 0 100 400"
          className="absolute fill-ink/[0.17] [transform:translateZ(8px)]"
          style={{ left: `${pctX(34)}%`, bottom: `${FLOOR}%`, height: `${pctY(FIG)}%`, aspectRatio: "1 / 4" }}
        >
          <ellipse cx="50" cy="27" rx="15" ry="19" />
          <rect x="22" y="52" width="56" height="132" rx="22" />
          <rect x="9" y="58" width="13" height="128" rx="6.5" />
          <rect x="78" y="58" width="13" height="128" rx="6.5" />
          <rect x="28" y="176" width="21" height="222" rx="9" />
          <rect x="51" y="176" width="21" height="222" rx="9" />
        </svg>
        <span
          className="absolute font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3"
          style={{ left: `${pctX(34)}%`, bottom: `calc(${FLOOR}% - 18px)` }}
        >
          {FIG} cm
        </span>

        {/* the work, at true size */}
        <div
          className="absolute transition-[left,bottom,width,height] duration-[800ms] ease-expo [transform:translateZ(26px)]"
          style={{ left: `${left}%`, bottom: `${bottom}%`, width: `${pctX(w)}%`, height: `${pctY(h)}%` }}
        >
          <div className="size-full shadow-[0_14px_26px_rgba(60,40,20,0.28)]">
            <Photo fill src={work.photo} ratio={work.ratio} alt={`${work.title}, ${mediumOf(work)}, at true size`} eager />
          </div>

          {/* dimension lines */}
          <div className="absolute inset-x-0 -top-3.5 h-2 border-x border-ink/55">
            <i className="absolute inset-x-0 top-1/2 block h-px bg-ink/55" />
          </div>
          <span className="absolute -top-[30px] left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] tracking-[0.06em] text-ink-2">
            {cm(w)}
          </span>
          <div className="absolute inset-y-0 -left-3.5 w-2 border-y border-ink/55">
            <i className="absolute inset-y-0 left-1/2 block w-px bg-ink/55" />
          </div>
          <span className="absolute right-[calc(100%+24px)] top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[10px] tracking-[0.06em] text-ink-2">
            {cm(h)}
          </span>
        </div>
      </div>
    </div>
  );
}
