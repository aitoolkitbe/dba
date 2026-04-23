"use client";

import { useEffect, useState } from "react";
import type { UserMode } from "@/lib/types";
import { Brain, Megaphone, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const MODES: { id: UserMode; label: string; icon: React.ReactNode; blurb: string }[] = [
  {
    id: "strategist",
    label: "Strategist",
    icon: <Brain className="h-4 w-4" />,
    blurb:
      "Full jargon, direct scoring input, all Ehrenberg-Bass terminology. For planners and brand consultants.",
  },
  {
    id: "marketer",
    label: "Marketer",
    icon: <Megaphone className="h-4 w-4" />,
    blurb:
      "Guided explanations, plain language, decisions framed around business impact. For marketing leads.",
  },
  {
    id: "creative",
    label: "Creative",
    icon: <Palette className="h-4 w-4" />,
    blurb:
      "Asset-first view, execution checklists, consistency guardrails. For designers, writers, art directors.",
  },
];

export function ModeSwitch({
  value,
  onChange,
  compact,
}: {
  value?: UserMode;
  onChange?: (m: UserMode) => void;
  compact?: boolean;
}) {
  const [local, setLocal] = useState<UserMode>(value ?? "strategist");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem("dba.mode") as UserMode | null) : null;
    if (stored && !value) setLocal(stored);
  }, [value]);

  const mode = value ?? local;
  const active = MODES.find((m) => m.id === mode) ?? MODES[0];

  const pick = (m: UserMode) => {
    setLocal(m);
    if (typeof window !== "undefined") localStorage.setItem("dba.mode", m);
    onChange?.(m);
  };

  if (compact) {
    return (
      <div className="inline-flex rounded-full border border-ink-200 bg-white p-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => pick(m.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition",
              mode === m.id ? "bg-ink-900 text-white" : "text-ink-600 hover:text-ink-900"
            )}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="label mb-3">Choose your mode</div>
      <div className="grid gap-2 sm:grid-cols-3">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => pick(m.id)}
            className={cn(
              "rounded-xl border p-4 text-left transition",
              mode === m.id
                ? "border-ink-900 bg-ink-900 text-white"
                : "border-ink-200 bg-white hover:border-ink-400"
            )}
          >
            <div className="flex items-center gap-2 font-medium">
              {m.icon}
              {m.label}
            </div>
            <p
              className={cn(
                "mt-2 text-xs leading-relaxed",
                mode === m.id ? "text-ink-100" : "text-ink-500"
              )}
            >
              {m.blurb}
            </p>
          </button>
        ))}
      </div>
      <div className="mt-3 text-[11px] text-ink-500">
        Active: <span className="font-medium text-ink-700">{active.label}</span>. Your
        choice is remembered on this device.
      </div>
    </div>
  );
}
