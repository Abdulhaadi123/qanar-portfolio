"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Watches every [data-reveal] element and flips data-in="true" once it is on screen. */
export default function RevealRoot() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.in = "true";
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );
    const scan = () => document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])").forEach((n) => io.observe(n));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
