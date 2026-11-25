import Link from "next/link";
import type { SiteSettings } from "@/lib/content/types";
import { Label, Lines, Wrap, ulink } from "./ui";

export default function Footer({ site }: { site: SiteSettings }) {
  return (
    <footer className="border-t border-line-strong pb-7 pt-[clamp(48px,7vw,96px)]">
      <Wrap>
        <Label>Contact</Label>
        <p className="mt-5 font-display text-[clamp(2.6rem,8vw,7.4rem)] font-[320] leading-[0.98] tracking-[-0.035em]">
          <Lines
            lines={[
              "Let’s talk",
              <em key="e" className="font-light text-ink-2">
                about art.
              </em>,
            ]}
          />
        </p>
        <p className="mt-6 max-w-[48ch] text-ink-2">{site.footerBlurb}</p>

        <div className="mt-[clamp(40px,6vw,80px)] grid grid-cols-1 gap-x-8 gap-y-10 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>Studio</Label>
            <address className="mt-3 not-italic leading-relaxed text-ink-2">
              {site.studio.map((l, i) => (
                <span key={i} className="block">
                  {l}
                </span>
              ))}
              <span className="block">{site.base.split(",")[0]}</span>
            </address>
            {site.studio2.length > 0 && (
              <address className="mt-3 not-italic leading-relaxed text-ink-2">
                {site.studio2.map((l, i) => (
                  <span key={i} className="block">
                    {l}
                  </span>
                ))}
              </address>
            )}
          </div>
          <div>
            <Label>Inquiries</Label>
            <ul className="m-0 mt-3 list-none space-y-1 p-0 text-ink-2">
              {site.email && (
                <li>
                  <a href={`mailto:${site.email}`} className={ulink}>
                    {site.email}
                  </a>
                </li>
              )}
              {site.email2 && (
                <li>
                  <a href={`mailto:${site.email2}`} className={ulink}>
                    {site.email2}
                  </a>
                </li>
              )}
              {site.phone && (
                <li>
                  <a href={`tel:${site.phoneHref}`} className={ulink}>
                    {site.phone}
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div>
            <Label>Connect</Label>
            <ul className="mt-3 space-y-1 text-ink-2">
              {site.socials.map((s, i) => (
                <li key={`${s.label}-${i}`}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className={ulink}>
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Label>Site</Label>
            <ul className="mt-3 space-y-1 text-ink-2">
              {[
                ["/works", "Works"],
                ["/about", "About"],
                ["/journal", "Journal"],
                ["/contact", "Commissions & contact"],
              ].map(([href, l]) => (
                <li key={href}>
                  <Link href={href} className={ulink}>
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-[clamp(40px,6vw,80px)] flex flex-wrap items-end justify-between gap-4 border-t border-line pt-5">
          <Label>© 2026 {site.name}. All artworks reproduced with permission of the artist.</Label>
          <p lang="ur" dir="rtl" className="font-script text-[1.7rem] leading-[1.6] text-ink-2">
            {site.nameUrdu}
          </p>
        </div>
      </Wrap>
    </footer>
  );
}
