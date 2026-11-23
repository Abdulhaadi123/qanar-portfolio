import Link from "next/link";
import { site } from "@/data/site";
import { Label, Lines, Wrap, ulink } from "./ui";

export default function Footer() {
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
        <p className="mt-6 max-w-[48ch] text-ink-2">
          To buy a work, commission a piece, or invite me for a talk or class — send a message and I’ll reply by email.
        </p>

        <div className="mt-[clamp(40px,6vw,80px)] grid grid-cols-1 gap-x-8 gap-y-10 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>Studio</Label>
            <address className="mt-3 not-italic leading-relaxed text-ink-2">
              {site.studio.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
              <span className="block">{site.base.split(",")[0]}</span>
            </address>
          </div>
          <div>
            <Label>Inquiries</Label>
            <p className="mt-3 text-ink-2">
              <a href={`mailto:${site.email}`} className={ulink}>
                {site.email}
              </a>
            </p>
          </div>
          <div>
            <Label>Connect</Label>
            <ul className="mt-3 space-y-1 text-ink-2">
              {site.socials.map((s) => (
                <li key={s.label}>
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
          <p lang="ur" dir="rtl" className="font-urdu text-[1.5rem] leading-[1.9] text-ink-2">
            {site.nameUrdu}
          </p>
        </div>
      </Wrap>
    </footer>
  );
}
