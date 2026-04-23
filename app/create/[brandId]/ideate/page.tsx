import { BrandGate } from "@/components/BrandGate";
import { IdeateWorkspace } from "@/components/IdeateWorkspace";

export default function IdeatePage({
  params,
}: {
  params: { brandId: string };
}) {
  return (
    <div className="pt-6">
      <BrandGate brandId={params.brandId}>
        {(brand) => <IdeateWorkspace brand={brand} />}
      </BrandGate>
    </div>
  );
}
