import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "DBA Workbench — Distinctive Brand Asset strategy tool",
  description:
    "Audit, create and deploy distinctive brand assets. Built on the principles of Byron Sharp (How Brands Grow) and Jenni Romaniuk (Building Distinctive Brand Assets).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        <main className="mx-auto max-w-6xl px-6 pb-24 pt-6">{children}</main>
        <footer className="border-t border-ink-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-ink-500">
            DBA Workbench · Built on Jenni Romaniuk&apos;s framework (Ehrenberg-Bass
            Institute). Not affiliated with any brand shown in demos.
          </div>
        </footer>
      </body>
    </html>
  );
}
