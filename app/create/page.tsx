import { Hammer } from "lucide-react";
import { CreateIndex } from "@/components/CreateIndex";

export const metadata = {
  title: "Create — DBA Workbench",
};

export default function CreatePage() {
  return (
    <div className="space-y-10 pt-6">
      <header>
        <div className="chip mb-3">
          <Hammer className="h-3 w-3" /> Create module
        </div>
        <h1 className="text-4xl">Design assets that are distinct from day one.</h1>
        <p className="mt-3 max-w-prose text-ink-600">
          Pick a brand to start ideation, run a category-code scan or
          stress-test a candidate. The Create module works best after an
          audit — the gaps in your inventory become the briefs for new
          assets.
        </p>
      </header>
      <CreateIndex />
    </div>
  );
}
