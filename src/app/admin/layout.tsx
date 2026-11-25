import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Studio admin", template: "%s · Studio admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-paper text-ink">{children}</div>;
}
