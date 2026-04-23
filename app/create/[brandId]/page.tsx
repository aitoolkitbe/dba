import { BrandGate } from "@/components/BrandGate";
import { BrandCreateHub } from "@/components/BrandCreateHub";

export default function BrandCreateHubPage({
  params,
}: {
  params: { brandId: string };
}) {
  return (
    <div className="pt-6">
      <BrandGate brandId={params.brandId}>
        {(brand) => <BrandCreateHub brand={brand} />}
      </BrandGate>
    </div>
  );
}
