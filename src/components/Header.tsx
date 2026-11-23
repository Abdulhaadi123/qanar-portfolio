"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";

const links = [
  { href: "/works", label: "Works", no: "01" },
  { href: "/about", label: "About", no: "02" },
  { href: "/journal", label: "Journal", no: "03" },
  { href: "/contact", label: "Contact", no: "04" },
];

export default function Header() {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const meter = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    let travel = 0; // distance scrolled in the current direction
    let isSolid = false;
    let isHidden = false;
    let raf = 0;

    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;

      if (meter.current) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        meter.current.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, y / max)) : 0})`;
      }

      const wantSolid = y > 40;
      if (wantSolid !== isSolid) {
        isSolid = wantSolid;
        setSolid(wantSolid);
      }

      // Hide when the visitor has clearly scrolled down, show when they clearly scroll up.
      // Small back-and-forth movements (trackpad momentum, a busy page) change nothing.
      if (y < 240) {
        travel = 0;
        if (isHidden) {
          isHidden = false;
          setHidden(false);
        }
        return;
      }
      if (dy !== 0) travel = Math.sign(dy) === Math.sign(travel) ? travel + dy : dy;
      if (!isHidden && travel > 120) {
        isHidden = true;
        travel = 0;
        setHidden(true);
      } else if (isHidden && travel < -48) {
        isHidden = false;
        travel = 0;
        setHidden(false);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const bar = "absolute left-2.5 right-2.5 h-[1.5px] bg-ink transition-all duration-500 ease-expo";

  return (
    <>
      {/* A solid bar: no blur behind it, so scrolling over the 3D scenes stays smooth. */}
      <header
        className={`fixed inset-x-0 top-0 z-60 h-head border-b transition-[transform,background-color,border-color] duration-500 ease-expo ${
          solid ? "border-line bg-paper" : "border-transparent bg-transparent"
        } ${hidden && !open ? "-translate-y-full" : "translate-y-0"}`}
      >
        <div className="mx-auto flex h-full max-w-[1544px] items-center justify-between gap-6 px-gutter">
          <Link href="/" className="inline-flex items-baseline gap-3" aria-label="Qamar Abbas, home">
            <span className="font-display text-[1.35rem] font-[420] tracking-[-0.02em]">{site.name}</span>
            <span lang="ur" className="translate-y-px font-script text-[1.25rem] text-seal">
              قمر
            </span>
          </Link>

          <nav className="hidden items-center gap-[clamp(18px,2.6vw,40px)] md:flex" aria-label="Main">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={pathname.startsWith(l.href) ? "page" : undefined}
                className="relative py-1.5 font-mono text-[0.74rem] uppercase tracking-[0.1em] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-500 after:ease-expo hover:after:scale-x-100 aria-[current=page]:after:scale-x-100"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative -mr-2.5 size-11 md:hidden"
          >
            <i className={`${bar} ${open ? "top-[21.5px] rotate-45" : "top-[18px]"}`} />
            <i className={`${bar} ${open ? "top-[21.5px] -rotate-45" : "top-[25px]"}`} />
          </button>
        </div>
        {/* reading progress */}
        <span ref={meter} aria-hidden className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-seal" />
      </header>

      <div
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-0 z-55 flex flex-col justify-between bg-paper px-gutter pb-8 pt-[calc(var(--spacing-head)+24px)] transition-[clip-path,visibility] duration-700 ease-expo md:hidden ${
          open ? "visible [clip-path:inset(0_0_0_0)]" : "invisible [clip-path:inset(0_0_100%_0)]"
        }`}
      >
        <nav aria-label="Mobile" className="flex flex-col">
          {[{ href: "/", label: "Home", no: "00" }, ...links].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-baseline gap-4 border-b border-line py-2.5 font-display text-[clamp(2.6rem,11vw,4.4rem)] font-[330] leading-[1.15] tracking-[-0.03em]"
            >
              <small className="font-mono text-[0.7rem] tracking-[0.1em] text-ink-3">{l.no}</small>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="font-mono text-[0.74rem] uppercase tracking-[0.1em] text-ink-3">
          <p className="m-0">{site.email}</p>
          <p className="m-0 mt-1">{site.base}</p>
        </div>
      </div>
    </>
  );
}
