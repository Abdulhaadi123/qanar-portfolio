"use client";

import { useState } from "react";
import { site } from "@/data/site";

/**
 * The studio portrait of Qamar Abbas from his Wix site.
 * Tries /media/portrait.jpg first (put the original photograph there), then the Wix image.
 * Until a photograph has loaded, his name in calligraphy sits in its place.
 */
export default function Portrait({ className = "" }: { className?: string }) {
  const [i, setI] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const src = site.portrait[i];

  return (
    <div className={`relative overflow-hidden bg-ink ${className}`}>
      <div className="absolute inset-0 grid place-items-center">
        <span lang="ur" dir="rtl" className="font-script text-[clamp(5rem,12vw,9rem)] leading-none text-paper/85">
          قمر
        </span>
      </div>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt="Qamar Abbas, visual artist, in a studio portrait"
          onLoad={() => setLoaded(true)}
          onError={() => setI((n) => n + 1)}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 size-full object-cover object-[50%_18%] transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
