import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/fraunces/opsz-italic.css";
import "@fontsource-variable/inter-tight/index.css";
import "@fontsource-variable/jetbrains-mono/index.css";
import "@fontsource/aref-ruqaa/400.css";
import "@fontsource/aref-ruqaa/700.css";
import "@fontsource/noto-nastaliq-urdu/400.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RevealRoot from "@/components/RevealRoot";
import { site } from "@/data/site";

const description =
  "Qamar Abbas is a visual artist and art educator based in Lahore, from the Oshikhandass valley in Gilgit-Baltistan. Calligraphy on paper birch (Bhojpatra), landscape and cultural memory.";

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  title: { default: "Qamar Abbas — Visual artist & art educator", template: "%s — Qamar Abbas" },
  description,
  openGraph: {
    type: "website",
    title: "Qamar Abbas — Visual artist & art educator",
    description,
    siteName: site.name,
  },
  twitter: { card: "summary_large_image", title: "Qamar Abbas — Visual artist", description },
};

export const viewport: Viewport = {
  themeColor: "#f1ece1",
  width: "device-width",
  initialScale: 1,
};

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}[data-reveal]>div{clip-path:none!important}[data-lines] span span{transform:none!important}`}</style>
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {/* faint paper grain */}
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] bg-[url('/grain.svg')] opacity-40 mix-blend-multiply" />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <RevealRoot />
      </body>
    </html>
  );
}
