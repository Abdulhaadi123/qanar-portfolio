"use client";

import { useEffect, useRef } from "react";

/**
 * A paragraph whose words darken one by one as it crosses the screen.
 * Driven by scroll position only, so the page itself never slows down.
 */
export default function ScrollText({ text, className = "" }: { text: string; className?: string }) {
  const box = useRef<HTMLParagraphElement>(null);
  const words = text.split(/\s+/);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-w]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      spans.forEach((s) => (s.style.opacity = "1"));
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // from "top of the paragraph at 82% of the screen" to "bottom of it at 42%"
      const p = Math.min(1, Math.max(0, (vh * 0.82 - r.top) / (r.height + vh * 0.4)));
      const lit = p * (spans.length + 6);
      spans.forEach((s, i) => {
        const k = Math.min(1, Math.max(0, lit - i));
        s.style.opacity = String(0.14 + 0.86 * k);
      });
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

  return (
    <p ref={box} aria-label={text} data-scrub className={className}>
      {words.map((w, i) => (
        <span key={i} data-w aria-hidden style={{ opacity: 0.14 }}>
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
