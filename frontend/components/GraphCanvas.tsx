"use client";

import { useExecutionStore } from "@/store/useExecutionStore";
import { findGraphVar } from "@/lib/visualization/deriveStructures";

/** Best-effort: look for a companion visited/seen set so traversed nodes can be highlighted. */
function findVisitedSet(scope: Record<string, unknown>): Record<string, unknown> | null {
  for (const [key, value] of Object.entries(scope)) {
    if (!/visited|seen/i.test(key)) continue;
    if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  }
  return null;
}

export default function GraphCanvas() {
  const step = useExecutionStore((s) => s.currentStep());
  if (!step) return null;

  const graphs = findGraphVar(step.scope);
  if (graphs.length === 0) return null;
  const visited = findVisitedSet(step.scope);

  return (
    <div className="flex flex-col gap-6 items-center py-4 w-full">
      {graphs.map(([key, adjacency]) => (
        <div key={key} className="flex flex-col items-center gap-3 w-full max-w-md">
          <div className="font-mono text-[0.68rem] text-ink-faint uppercase tracking-wider">{key}</div>
          <div className="flex flex-col gap-1.5 w-full">
            {Object.entries(adjacency).map(([node, neighbors]) => {
              const isVisited = visited ? Boolean(visited[node]) : false;
              return (
                <div
                  key={node}
                  className={`flex items-center gap-2 font-mono text-xs px-3 py-2 rounded-lg border transition-colors duration-300 ${
                    isVisited ? "bg-emerald/10 border-emerald/50" : "bg-surface-2 border-border-soft"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold border ${
                      isVisited ? "border-emerald text-emerald" : "border-border text-ink-dim"
                    }`}
                  >
                    {node}
                  </span>
                  <span className="text-ink-faint">→</span>
                  <span className="text-ink-dim">{(neighbors as unknown[]).join(", ")}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
