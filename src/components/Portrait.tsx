"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";

/**
 * The studio portrait of Qamar Abbas from his Wix site.
 * Tries /media/portrait.jpg first, then the Wix image; until a photograph has loaded his name in calligraphy sits in its place.
 * The photograph drifts a little against its frame as the page scrolls.
 */
export default function Portrait({ className = "" }: { className?: string }) {
  const [i, setI] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const src = site.portrait[i];

  // the photograph can finish loading before React attaches onLoad (server-rendered page)
  useEffect(() => {
    const im = img.current;
    if (im && im.complete && im.naturalWidth > 0) setLoaded(true);
  }, [src]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = box.current;
      const im = img.current;
      if (!el || !im) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const k = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)));
      im.style.transform = `translate3d(0, ${k * -6}%, 0) scale(1.14)`;
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
    <div ref={box} className={`relative overflow-hidden bg-ink ${className}`}>
      <div className="absolute inset-0 grid place-items-center">
        <span lang="ur" dir="rtl" className="font-script text-[clamp(5rem,12vw,9rem)] leading-none text-paper/85">
          قمر
        </span>
      </div>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={img}
          key={src}
          src={src}
          alt="Qamar Abbas, visual artist, in a studio portrait"
          onLoad={() => setLoaded(true)}
          onError={() => setI((n) => n + 1)}
          decoding="async"
          style={{ transform: "scale(1.14)" }}
          className={`absolute inset-0 size-full object-cover object-[50%_18%] transition-opacity duration-700 will-change-transform ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
