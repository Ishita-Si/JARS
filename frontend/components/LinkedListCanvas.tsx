"use client";

import { useExecutionStore } from "@/store/useExecutionStore";
import { findListVar, walkLinkedList } from "@/lib/visualization/deriveStructures";

export default function LinkedListCanvas() {
  const step = useExecutionStore((s) => s.currentStep());
  if (!step) return null;

  const lists = findListVar(step.scope);
  if (lists.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 items-center py-4 w-full">
      {lists.map(([key, head]) => {
        const items = walkLinkedList(head);
        return (
          <div key={key} className="flex flex-col items-center gap-3">
            <div className="font-mono text-[0.68rem] text-ink-faint uppercase tracking-wider">{key}</div>
            <div className="flex items-center flex-wrap justify-center gap-1">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="w-11 h-11 rounded-lg border border-indigo/40 bg-indigo-soft flex items-center justify-center font-mono font-semibold text-sm">
                    {String(item.value)}
                  </div>
                  {i < items.length - 1 && <span className="text-ink-faint font-mono text-sm">→</span>}
                </div>
              ))}
              <span className="text-ink-faint font-mono text-sm ml-1">→ null</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
