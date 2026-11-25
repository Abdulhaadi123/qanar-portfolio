import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/fraunces/opsz-italic.css";
import "@fontsource-variable/inter-tight/index.css";
import "@fontsource-variable/jetbrains-mono/index.css";
import "@fontsource/aref-ruqaa/400.css";
import "@fontsource/aref-ruqaa/700.css";
import "./globals.css";
import { getContent } from "@/lib/content/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getContent();
  const title = `${site.name} — ${site.role}`;
  return {
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
    title: { default: title, template: `%s — ${site.name}` },
    description: site.seoDescription,
    openGraph: { type: "website", title, description: site.seoDescription, siteName: site.name },
    twitter: { card: "summary_large_image", title: `${site.name} — Visual artist`, description: site.seoDescription },
  };
}

export const viewport: Viewport = {
  themeColor: "#f1ece1",
  width: "device-width",
  initialScale: 1,
};

/** The shell shared by the public site and the admin panel. The public site's header, footer and effects are in SiteChrome. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
