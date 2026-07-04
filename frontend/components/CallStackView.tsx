"use client";

import { useExecutionStore } from "@/store/useExecutionStore";

export default function CallStackView() {
  const currentStep = useExecutionStore((s) => s.currentStep());
  const stack = currentStep?.callStack ?? [];

  return (
    <div className="bg-surface-2 border border-border-soft rounded-lg p-4 min-w-[150px] flex-1">
      <div className="font-mono text-[0.62rem] uppercase tracking-wider text-ink-faint mb-2">Call Stack</div>
      <div className="flex flex-col-reverse gap-1">
        {stack.map((frame, i) => (
          <div
            key={i}
            className={`font-mono text-xs px-2 py-1 rounded-md border ${
              i === stack.length - 1
                ? "bg-indigo-soft border-indigo text-ink"
                : "border-border-soft text-ink-dim"
            }`}
          >
            {frame}()
          </div>
        ))}
        {stack.length === 0 && <div className="font-mono text-xs text-ink-faint">—</div>}
      </div>
    </div>
  );
}
