import { BrandGate } from "@/components/BrandGate";
import { StressTestWorkspace } from "@/components/StressTestWorkspace";

export default function StressTestPage({
  params,
}: {
  params: { brandId: string };
}) {
  return (
    <div className="pt-6">
      <BrandGate brandId={params.brandId}>
        {(brand) => <StressTestWorkspace brand={brand} />}
      </BrandGate>
    </div>
  );
}
