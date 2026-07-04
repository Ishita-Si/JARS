"use client";

import { useExecutionStore } from "@/store/useExecutionStore";
import { isListNode, isTreeNode, isAdjacencyList } from "@/lib/visualization/deriveStructures";

const SKIP_KEYS = new Set(["console", "Math", "arguments"]);

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    !(typeof v === "string" && (v as string).startsWith("ƒ ")) &&
    !isListNode(v) &&
    !isTreeNode(v) &&
    !isAdjacencyList(v)
  );
}

export default function HashMapCanvas() {
  const trace = useExecutionStore((s) => s.trace);
  const currentIndex = useExecutionStore((s) => s.currentIndex);
  const step = useExecutionStore((s) => s.currentStep());
  if (!step) return null;

  const prevStep = currentIndex > 0 ? trace?.steps[currentIndex - 1] : null;

  const objectEntries = Object.entries(step.scope).filter(
    ([key, v]) => !SKIP_KEYS.has(key) && isPlainObject(v) && Object.keys(v as object).length > 0
  ) as [string, Record<string, unknown>][];

  if (objectEntries.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 items-center py-4 w-full">
      {objectEntries.map(([key, obj]) => {
        const prevObj = (prevStep?.scope[key] as Record<string, unknown> | undefined) ?? {};
        return (
          <div key={key} className="flex flex-col items-center gap-3 w-full max-w-md">
            <div className="font-mono text-[0.68rem] text-ink-faint uppercase tracking-wider">{key}</div>
            <div className="flex gap-2 flex-wrap justify-center">
              {Object.entries(obj).map(([k, v]) => {
                const isNew = !(k in prevObj);
                return (
                  <div
                    key={k}
                    className={`font-mono text-xs px-3 py-2 rounded-lg border flex items-center gap-2 transition-all duration-300 ${
                      isNew
                        ? "bg-emerald/10 border-emerald text-emerald"
                        : "bg-surface-2 border-border-soft text-ink"
                    }`}
                  >
                    <span className="text-ink-dim">{k}</span>
                    <span>→</span>
                    <span className="font-semibold">{String(v)}</span>
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
