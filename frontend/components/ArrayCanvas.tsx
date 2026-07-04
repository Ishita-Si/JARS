"use client";

import { useExecutionStore } from "@/store/useExecutionStore";

const SKIP_KEYS = new Set(["console", "Math", "arguments"]);

function isPlainArray(v: unknown): v is unknown[] {
  return Array.isArray(v) && v.every((x) => typeof x === "number" || typeof x === "string");
}

/** Finds every array-of-primitives in scope, plus any integer variables that
 *  plausibly index into it (used to render "pointer" badges like low/high/mid,
 *  i/j, left/right — without hardcoding any variable names). */
function findArrayPointers(scope: Record<string, unknown>, arrKey: string, arr: unknown[]) {
  const pointers: { name: string; index: number }[] = [];
  for (const [key, value] of Object.entries(scope)) {
    if (key === arrKey || SKIP_KEYS.has(key)) continue;
    if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value < arr.length) {
      pointers.push({ name: key, index: value });
    }
  }
  return pointers;
}

export default function ArrayCanvas() {
  const trace = useExecutionStore((s) => s.trace);
  const currentIndex = useExecutionStore((s) => s.currentIndex);
  const step = useExecutionStore((s) => s.currentStep());
  if (!step) return null;

  const prevStep = currentIndex > 0 ? trace?.steps[currentIndex - 1] : null;

  const arrayEntries = Object.entries(step.scope).filter(
    ([key, v]) => !SKIP_KEYS.has(key) && isPlainArray(v) && (v as unknown[]).length > 0 && (v as unknown[]).length <= 24
  ) as [string, unknown[]][];

  if (arrayEntries.length === 0) return null;

  return (
    <div className="flex flex-col gap-8 items-center py-4">
      {arrayEntries.map(([key, arr]) => {
        const pointers = findArrayPointers(step.scope, key, arr);
        const prevArr = prevStep?.scope[key] as unknown[] | undefined;

        return (
          <div key={key} className="flex flex-col items-center gap-3">
            <div className="font-mono text-[0.68rem] text-ink-faint uppercase tracking-wider">{key}</div>
            <div className="flex gap-2 flex-wrap justify-center pt-6">
              {arr.map((val, i) => {
                const changed = prevArr && prevArr.length === arr.length && prevArr[i] !== val;
                const ptrs = pointers.filter((p) => p.index === i);
                return (
                  <div key={i} className="relative">
                    {ptrs.map((p, pi) => (
                      <span
                        key={p.name}
                        className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-[0.58rem] font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
                        style={{
                          top: `${-24 - pi * 18}px`,
                          color: pi % 2 === 0 ? "#8f6bff" : "#4fd6e8",
                          background: pi % 2 === 0 ? "rgba(109,99,255,0.14)" : "rgba(79,214,232,0.14)",
                        }}
                      >
                        {p.name}
                      </span>
                    ))}
                    <div
                      className={`w-11 h-11 rounded-lg border flex items-center justify-center font-mono font-semibold text-sm transition-all duration-300 ${
                        changed
                          ? "bg-amber/15 border-amber -translate-y-1.5"
                          : ptrs.length > 0
                          ? "bg-indigo-soft border-indigo shadow-[0_0_16px_rgba(109,99,255,0.3)]"
                          : "bg-surface-2 border-border"
                      }`}
                    >
                      {String(val)}
                    </div>
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[0.6rem] text-ink-faint">
                      {i}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
