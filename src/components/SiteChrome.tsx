import { preconnect } from "react-dom";
import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import RevealRoot from "@/components/RevealRoot";
import { getContent } from "@/lib/content/queries";
import { SUPABASE_URL, hasSupabase } from "@/lib/supabase/config";

/** Header, footer, paper grain and scroll reveals around every public page. */
export default async function SiteChrome({ children }: { children: ReactNode }) {
  const { site } = await getContent();
  // photographs added in the admin panel come from the storage host: open that connection early
  if (hasSupabase) preconnect(SUPABASE_URL, { crossOrigin: "anonymous" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    alternateName: site.nameUrdu,
    jobTitle: "Visual artist and art educator",
    email: site.email,
    alumniOf: { "@type": "CollegeOrUniversity", name: "National College of Arts, Lahore" },
    homeLocation: { "@type": "Place", name: site.base },
    sameAs: site.socials.map((s) => s.href),
  };

  return (
    <>
      <noscript>
        <style>{`[data-reveal]{opacity:1!important;transform:none!important}[data-reveal]>div{clip-path:none!important}[data-lines] span span{transform:none!important}[data-scrub] span{opacity:1!important}`}</style>
      </noscript>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      {/* faint paper grain */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] bg-[url('/grain.svg')] opacity-[0.55]" />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <Header name={site.name} email={site.email} base={site.base} />
      <main id="main">{children}</main>
      <Footer site={site} />
      <RevealRoot />
    </>
  );
}
