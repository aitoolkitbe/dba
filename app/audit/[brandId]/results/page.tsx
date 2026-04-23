import { notFound } from "next/navigation";
import { getBrandById } from "@/lib/demo-brands";
import { AuditWorkspace } from "@/components/AuditWorkspace";

export default function AuditResultsPage({
  params,
}: {
  params: { brandId: string };
}) {
  const brand = getBrandById(params.brandId);
  if (!brand) notFound();
  return (
    <div className="pt-6">
      <AuditWorkspace brand={brand} />
    </div>
  );
}

export function generateStaticParams() {
  return [{ brandId: "coca-cola-demo" }];
}
