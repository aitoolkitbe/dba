import { AuditIndex } from "@/components/AuditIndex";
import { Radar } from "lucide-react";
import { ModeSwitch } from "@/components/ModeSwitch";

export const metadata = {
  title: "Audit — DBA Workbench",
};

export default function AuditIndexPage() {
  return (
    <div className="space-y-10 pt-6">
      <header className="flex items-start justify-between gap-6">
        <div>
          <div className="chip mb-3">
            <Radar className="h-3 w-3" />
            Audit module
          </div>
          <h1 className="text-4xl">Your audits</h1>
          <p className="mt-3 max-w-prose text-ink-600">
            Open the Coca-Cola demo to see the full framework in motion, or add
            your own brand in about five minutes.
          </p>
        </div>
        <ModeSwitch compact />
      </header>
      <AuditIndex />
    </div>
  );
}
