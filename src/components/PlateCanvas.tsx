"use client";

import { useEffect, useRef, useState } from "react";
import { paintPlate, plateFontsReady, type PlateStyle } from "@/lib/plates";

const skeleton =
  "absolute inset-0 animate-shimmer bg-[linear-gradient(100deg,var(--color-paper-2)_30%,#efe9dc_50%,var(--color-paper-2)_70%)] bg-[length:200%_100%]";

interface Props {
  style: PlateStyle;
  seed: number;
  ratio: number;
  /** a photograph, when one exists, replaces the drawing */
  photo?: string;
  alt: string;
  /** paint once at this CSS width instead of following the box size (for boxes that animate) */
  fixedW?: number;
  maxW?: number;
  /** fill the parent instead of using the aspect ratio */
  fill?: boolean;
  className?: string;
}

/** Draws a plate into a canvas when it is near the screen. */
export default function PlateCanvas({ style, seed, ratio, photo, alt, fixedW, maxW = 900, fill, className = "" }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (photo) return;
    const el = wrap.current;
    const c = canvas.current;
    if (!el || !c) return;
    let cancelled = false;
    let painted = false;
    let lastW = 0;
    const paint = async () => {
      const w = fixedW ?? Math.round(el.clientWidth);
      if (w < 20 || (painted && Math.abs(w - lastW) < 28)) return;
      lastW = w;
      await plateFontsReady();
      if (cancelled) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = Math.min(w, maxW);
      paintPlate(c, style, seed, cssW, cssW / ratio, dpr);
      painted = true;
      setReady(true);
    };
    const io = new IntersectionObserver(([e]) => e.isIntersecting && paint(), { rootMargin: "500px" });
    io.observe(el);
    const ro = fixedW ? null : new ResizeObserver(() => painted && paint());
    ro?.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      ro?.disconnect();
    };
  }, [style, seed, ratio, photo, fixedW, maxW]);

  return (
    <div
      ref={wrap}
      style={fill ? undefined : { aspectRatio: ratio }}
      className={`relative ${fill ? "size-full" : "w-full"} ${className}`}
    >
      {!ready && !photo && <div className={skeleton} />}
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={alt} className="absolute inset-0 size-full object-cover" />
      ) : (
        <canvas
          ref={canvas}
          role="img"
          aria-label={alt}
          className={`absolute inset-0 size-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
