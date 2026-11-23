"use client";

import { useRef, type PointerEvent } from "react";
import { mediumOf, type Work } from "@/data/works";
import Photo from "./Photo";
import { Label } from "./ui";

/** A work on the wall: tilts toward the pointer, opens the viewer on click. */
export default function Plate({ work, onOpen }: { work: Work; onOpen?: () => void }) {
  const tilt = useRef<HTMLDivElement>(null);
  const glare = useRef<HTMLDivElement>(null);

  const move = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== "mouse" || !tilt.current || !glare.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    tilt.current.style.transform = `rotateY(${(x - 0.5) * 8}deg) rotateX(${(0.5 - y) * 6}deg)`;
    glare.current.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,.4), transparent 58%)`;
    glare.current.style.opacity = "1";
  };
  const leave = () => {
    if (tilt.current) tilt.current.style.transform = "";
    if (glare.current) glare.current.style.opacity = "0";
  };

  return (
    <figure className="m-0">
      <button
        type="button"
        onClick={onOpen}
        onPointerMove={move}
        onPointerLeave={leave}
        aria-label={`Open ${work.title}, ${work.size}, ${mediumOf(work)}`}
        className="block w-full cursor-zoom-in text-left [perspective:900px]"
      >
        <div ref={tilt} className="transition-transform duration-500 ease-expo [transform-style:preserve-3d]">
          <div className="relative shadow-[0_14px_22px_rgba(70,50,30,0.2)]">
            <Photo src={work.photo} ratio={work.ratio} alt={`${work.title}, ${mediumOf(work).toLowerCase()}, ${work.size}`} />
            <div
              ref={glare}
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-300"
            />
          </div>
        </div>
      </button>
      <figcaption className="mt-4 flex items-baseline justify-between gap-3">
        <span className="font-display text-[1.05rem] tracking-[-0.01em]">
          {work.title} <Label className="inline">No. {work.no}</Label>
        </span>
        <Label className="text-right">{work.size}</Label>
      </figcaption>
    </figure>
  );
}
