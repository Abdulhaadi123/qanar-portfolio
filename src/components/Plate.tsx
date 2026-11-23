"use client";

import { useRef, type PointerEvent } from "react";
import { ratioOf, seedOf, styleOf, type Work } from "@/data/works";
import PlateCanvas from "./PlateCanvas";
import { Label } from "./ui";

/** A work as a plate: tilts toward the pointer, opens the viewer on click. */
export default function Plate({ work, onOpen, maxW = 760 }: { work: Work; onOpen?: () => void; maxW?: number }) {
  const tilt = useRef<HTMLDivElement>(null);
  const glare = useRef<HTMLDivElement>(null);

  const move = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== "mouse" || !tilt.current || !glare.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    tilt.current.style.transform = `rotateY(${(x - 0.5) * 9}deg) rotateX(${(0.5 - y) * 7}deg)`;
    glare.current.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,.42), transparent 58%)`;
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
        aria-label={`Open plate ${work.no}, ${work.size}, ${work.medium}`}
        className="block w-full cursor-zoom-in text-left [perspective:900px]"
      >
        <div ref={tilt} className="transition-transform duration-500 ease-expo [transform-style:preserve-3d]">
          <div className="relative drop-shadow-[0_14px_18px_rgba(70,50,30,0.22)]">
            <PlateCanvas
              style={styleOf(work)}
              seed={seedOf(work)}
              ratio={ratioOf(work)}
              photo={work.photo}
              alt={`Plate ${work.no}: ${work.medium}, ${work.size}`}
              maxW={maxW}
            />
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
        <Label>{work.size}</Label>
      </figcaption>
    </figure>
  );
}
