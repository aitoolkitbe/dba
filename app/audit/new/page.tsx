import { BrandWizard } from "@/components/BrandWizard";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "New brand — DBA Workbench",
};

export default function NewBrandPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-6">
      <Link
        href="/audit"
        className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to audits
      </Link>
      <header>
        <div className="chip mb-2">
          <Sparkles className="h-3 w-3" /> New brand
        </div>
        <h1 className="text-4xl">Add your brand to the workbench</h1>
        <p className="mt-2 max-w-prose text-ink-600">
          Takes about five minutes. Your data stays in this browser — nothing
          is sent to a server unless you explicitly ask Claude to help.
        </p>
      </header>
      <BrandWizard />
    </div>
  );
}
