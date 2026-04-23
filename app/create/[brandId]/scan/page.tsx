import { BrandGate } from "@/components/BrandGate";
import { CategoryScanWorkspace } from "@/components/CategoryScanWorkspace";

export default function ScanPage({
  params,
}: {
  params: { brandId: string };
}) {
  return (
    <div className="pt-6">
      <BrandGate brandId={params.brandId}>
        {(brand) => <CategoryScanWorkspace brand={brand} />}
      </BrandGate>
    </div>
  );
}
