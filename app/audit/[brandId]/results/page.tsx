import { AuditResultsClient } from "@/components/AuditResultsClient";

export default function AuditResultsPage({
  params,
}: {
  params: { brandId: string };
}) {
  return (
    <div className="pt-6">
      <AuditResultsClient brandId={params.brandId} />
    </div>
  );
}
