"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useBrand } from "@/lib/useBrands";
import type { Brand } from "@/lib/types";

/**
 * Client-side loader for a Brand (from demo registry or localStorage).
 * Handles hydration state and "not found" uniformly for Create-module pages.
 */
export function BrandGate({
  brandId,
  children,
}: {
  brandId: string;
  children: (brand: Brand) => React.ReactNode;
}) {
  const { brand, hydrated } = useBrand(brandId);

  if (!hydrated) {
    return (
      <div className="flex items-center gap-2 py-20 text-sm text-ink-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading brand…
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center">
        <h2 className="font-serif text-2xl">Brand not found</h2>
        <p className="mt-2 text-sm text-ink-600">
          This brand isn&apos;t available in this browser.
        </p>
        <Link href="/audit" className="btn-primary mt-6 inline-flex text-xs">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to audits
        </Link>
      </div>
    );
  }

  return <>{children(brand)}</>;
}
