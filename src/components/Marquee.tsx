"use client";

import { useEffect, useRef } from "react";
/**
 * Two bands of his series titles that slide sideways as the page scrolls, in opposite directions.
 * It follows the scroll position, so it never slows or hijacks the wheel.
 */
export default function Marquee({ titles }: { titles: string[] }) {
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const wrap = a.current?.parentElement;
      if (!wrap || !a.current || !b.current) return;
      const r = wrap.getBoundingClientRect();
      if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
      const seq = (a.current.firstElementChild as HTMLElement | null)?.offsetWidth || 1;
      const y = (window.innerHeight - r.top) * 0.42; // moves while the band crosses the screen
      a.current.style.transform = `translate3d(${-(y % seq)}px,0,0)`;
      b.current.style.transform = `translate3d(${-seq + (y % seq)}px,0,0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const seq = (
    <span className="inline-flex shrink-0 items-center">
      {titles.map((t, i) => (
        <span key={i} className="inline-flex items-center">
          <span className="px-[0.35em]">{t}</span>
          <i className="mx-[0.25em] inline-block size-[0.16em] rounded-full bg-seal" aria-hidden />
        </span>
      ))}
    </span>
  );

  return (
    <div aria-hidden className="overflow-hidden border-y border-line py-[clamp(18px,2.4vw,36px)]">
      <div ref={a} className="flex w-max whitespace-nowrap font-display text-[clamp(3.4rem,8.4vw,8.6rem)] font-[300] leading-[1.05] tracking-[-0.035em] will-change-transform">
        {seq}
        {seq}
        {seq}
      </div>
      <div
        ref={b}
        className="flex w-max whitespace-nowrap font-display text-[clamp(3.4rem,8.4vw,8.6rem)] font-[300] italic leading-[1.05] tracking-[-0.035em] text-transparent [-webkit-text-stroke:1px_var(--color-ink-3)] will-change-transform"
      >
        {seq}
        {seq}
        {seq}
      </div>
    </div>
  );
}
