"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { series } from "@/data/series";
import { worksByNo, worksOf } from "@/data/works";
import Photo from "./Photo";
import { Label, R } from "./ui";

/**
 * The four series: big type on ruled rows. On a desktop a large photograph of the series
 * follows the pointer while it is over a row; on a phone each row carries a small cover instead.
 */
export default function SeriesList() {
  const [hover, setHover] = useState(-1);
  const follower = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (min-width: 768px)").matches) return;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const loop = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      if (follower.current) follower.current.style.transform = `translate3d(${x + 36}px,${y - 150}px,0) rotate(${(tx - x) * 0.04}deg)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="border-t border-line-strong">
      {series.map((s, i) => {
        const cover = worksByNo(s.cover)!;
        return (
          <R key={s.slug} delay={i * 80}>
            <Link
              href={`/works#${s.slug}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(-1)}
              className="group/row grid grid-cols-[40px_minmax(0,1fr)_92px] items-center gap-x-5 gap-y-3 border-b border-line py-[clamp(22px,2.8vw,36px)] transition-[padding,background-color] duration-500 ease-expo hover:bg-paper-2/70 hover:px-3.5 md:grid-cols-[56px_minmax(0,1.1fr)_minmax(0,1fr)_32px]"
            >
              <span className="font-mono text-[0.78rem] text-ink-3">{s.no}</span>
              <div>
                <h3 className="m-0 font-display text-[clamp(1.7rem,3.6vw,3.3rem)] font-[340] leading-[1.02] tracking-[-0.028em] transition-transform duration-500 ease-expo group-hover/row:translate-x-2">
                  {s.title}
                </h3>
                <Label className="mt-3">
                  {s.kind} · {worksOf(s.id).length} works
                </Label>
              </div>
              <div className="col-start-2 row-start-2 md:col-start-3 md:row-start-1">
                <Label className="text-ink">{s.medium}</Label>
                <p className="m-0 mt-2 line-clamp-3 max-w-[46ch] text-[0.98rem] text-ink-2">{s.statement[0]}</p>
              </div>
              <div className="col-start-3 row-span-2 row-start-1 overflow-hidden md:hidden">
                <Photo src={cover.photo} ratio={0.8} alt={`${s.title}: ${cover.title}`} />
              </div>
              <span className="hidden self-center text-[1.4rem] transition-transform duration-500 ease-expo group-hover/row:translate-x-1.5 md:block">→</span>
            </Link>
          </R>
        );
      })}

      {/* the photograph that follows the pointer (desktop) */}
      <div
        ref={follower}
        aria-hidden
        className={`pointer-events-none fixed left-0 top-0 z-40 hidden h-[320px] w-[256px] overflow-hidden bg-paper-2 shadow-[0_24px_40px_rgba(70,50,30,0.3)] transition-opacity duration-300 md:block ${
          hover >= 0 ? "opacity-100" : "opacity-0"
        }`}
      >
        {series.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.id}
            src={worksByNo(s.cover)!.photo}
            alt=""
            className={`absolute inset-0 size-full object-cover transition-[opacity,transform] duration-500 ease-expo ${
              hover === i ? "scale-100 opacity-100" : "scale-110 opacity-0"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
