import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content/queries";

const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3210").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { posts } = await getContent();
  const pages = ["", "/works", "/about", "/journal", "/contact"].map((p) => ({ url: `${base}${p}`, lastModified: new Date() }));
  const articles = posts.map((p) => ({ url: `${base}/journal/${p.slug}`, lastModified: new Date(p.date) }));
  return [...pages, ...articles];
}
