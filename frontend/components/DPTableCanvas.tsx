"use client";

import { useExecutionStore } from "@/store/useExecutionStore";
import { findDPTableVar } from "@/lib/visualization/deriveStructures";

export default function DPTableCanvas() {
  const trace = useExecutionStore((s) => s.trace);
  const currentIndex = useExecutionStore((s) => s.currentIndex);
  const step = useExecutionStore((s) => s.currentStep());
  if (!step) return null;

  const prevStep = currentIndex > 0 ? trace?.steps[currentIndex - 1] : null;
  const tables = findDPTableVar(step.scope);
  if (tables.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 items-center py-4 w-full">
      {tables.map(([key, table]) => {
        const prevTable = prevStep?.scope[key] as unknown[][] | undefined;
        const cols = Math.max(0, ...table.map((row) => (Array.isArray(row) ? row.length : 0)));

        return (
          <div key={key} className="flex flex-col items-center gap-2">
            <div className="font-mono text-[0.68rem] text-ink-faint uppercase tracking-wider">{key}</div>
            <div className="inline-flex flex-col gap-1 bg-surface-2 border border-border-soft rounded-lg p-2">
              {table.map((row, r) => (
                <div key={r} className="flex gap-1">
                  {Array.from({ length: cols }).map((_, c) => {
                    const value = Array.isArray(row) ? row[c] : undefined;
                    const prevValue = prevTable?.[r]?.[c];
                    const changed = prevTable ? prevValue !== value : false;
                    const filled = value !== undefined && value !== 0 && value !== "";
                    return (
                      <div
                        key={c}
                        className={`w-9 h-9 rounded-md border flex items-center justify-center font-mono text-[0.7rem] font-semibold transition-all duration-300 ${
                          changed
                            ? "bg-amber/20 border-amber scale-110"
                            : filled
                            ? "bg-indigo-soft border-indigo/40 text-ink"
                            : "bg-bg-2 border-border-soft text-ink-faint"
                        }`}
                      >
                        {value === undefined ? "" : String(value)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
