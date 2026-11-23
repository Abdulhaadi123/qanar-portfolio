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
    let queued = 0;
    const scan = () => {
      queued = 0;
      document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])").forEach((n) => io.observe(n));
    };
    const schedule = () => {
      if (!queued) queued = requestAnimationFrame(scan);
    };
    scan();
    const mo = new MutationObserver((records) => {
      // only DOM that adds elements matters, not text or style changes
      if (records.some((r) => r.addedNodes.length && Array.from(r.addedNodes).some((n) => n.nodeType === 1))) schedule();
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      if (queued) cancelAnimationFrame(queued);
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
