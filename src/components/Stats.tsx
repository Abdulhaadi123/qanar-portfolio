"use client";

import { useEffect, useRef } from "react";
import { Label, Wrap } from "./ui";

/** Real numbers from his portfolio: 39 works, 4 series, 9 exhibitions and awards, first shown in 2014. */
const stats = [
  { to: 39, label: "Works", note: "photographed and listed" },
  { to: 4, label: "Series", note: "birch, power, people, thread" },
  { to: 9, label: "Exhibitions & awards", note: "Karachi to New York" },
  { to: 2014, label: "First exhibition", note: "Karachi Arts Council", plain: true },
];

export default function Stats() {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const run = () => {
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / 1600);
        const e = 1 - Math.pow(1 - k, 4);
        stats.forEach((s, i) => {
          const n = Math.round(s.to * e);
          const node = refs.current[i];
          if (node) node.textContent = s.plain ? String(Math.max(1900, n)) : String(n);
        });
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    if (reduce) {
      stats.forEach((s, i) => {
        const node = refs.current[i];
        if (node) node.textContent = String(s.to);
      });
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section aria-label="In numbers" className="border-b border-line">
      <Wrap>
        <div ref={box} className="grid grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="border-line px-0 py-[clamp(28px,4vw,56px)] max-lg:odd:pr-6 max-lg:even:border-l max-lg:even:pl-6 max-lg:[&:nth-child(n+3)]:border-t lg:border-l lg:px-8 lg:first:border-l-0 lg:first:pl-0"
            >
              <p className="m-0 font-display text-[clamp(3rem,6.4vw,6rem)] font-[300] leading-none tracking-[-0.04em] tabular-nums">
                <span ref={(n) => void (refs.current[i] = n)}>{s.to}</span>
              </p>
              <Label className="mt-4 text-ink">{s.label}</Label>
              <p className="m-0 mt-1 text-[0.9rem] text-ink-3">{s.note}</p>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  );
}
