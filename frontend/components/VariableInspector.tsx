"use client";

import { useExecutionStore } from "@/store/useExecutionStore";

function formatValue(v: unknown): string {
  if (v === undefined) return "undefined";
  if (typeof v === "string" && v.startsWith("ƒ ")) return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

export default function VariableInspector() {
  const currentStep = useExecutionStore((s) => s.currentStep());
  const entries = currentStep ? Object.entries(currentStep.scope) : [];

  return (
    <div className="bg-surface-2 border border-border-soft rounded-lg p-4 min-w-[180px] flex-1">
      <div className="font-mono text-[0.62rem] uppercase tracking-wider text-ink-faint mb-2">Variables</div>
      {entries.length === 0 && <div className="font-mono text-xs text-ink-faint">No variables yet</div>}
      <div className="space-y-1">
        {entries.map(([key, value]) => (
          <div key={key} className="flex justify-between gap-3 font-mono text-xs">
            <span className="text-ink-dim truncate">{key}</span>
            <span className="text-ink font-semibold truncate max-w-[140px]">{formatValue(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
