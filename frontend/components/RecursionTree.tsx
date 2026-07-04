"use client";

import { useExecutionStore } from "@/store/useExecutionStore";
import { buildRecursionTree, nodeStatus, RecursionNode } from "@/lib/visualization/buildRecursionTree";

function NodeBox({ node }: { node: RecursionNode }) {
  const currentIndex = useExecutionStore((s) => s.currentIndex);
  const goTo = useExecutionStore((s) => s.goTo);
  const status = nodeStatus(node, currentIndex);
  const isCurrent = node.callStepIndex === currentIndex || node.returnStepIndex === currentIndex;

  const styles =
    status === "pending"
      ? "opacity-30 border-border bg-surface-2 text-ink-faint"
      : status === "active"
      ? "border-indigo bg-indigo-soft text-ink shadow-[0_0_16px_rgba(109,99,255,0.35)]"
      : "border-emerald/50 bg-emerald/10 text-ink";

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => goTo(node.returnStepIndex ?? node.callStepIndex)}
        className={`font-mono text-xs px-3 py-2 rounded-lg border transition-all duration-300 whitespace-nowrap ${styles} ${
          isCurrent ? "ring-2 ring-cyan ring-offset-2 ring-offset-bg" : ""
        }`}
        title="Jump to this call"
      >
        <div className="font-semibold">
          {node.name}({(node.args ?? []).join(", ")})
        </div>
        {status === "done" && <div className="text-emerald text-[0.68rem] mt-0.5">→ {JSON.stringify(node.returnValue)}</div>}
      </button>

      {node.children.length > 0 && (
        <>
          <div className="w-px h-4 bg-border-soft" />
          <div className="flex gap-5 pt-3 border-t border-border-soft">
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-px h-3 bg-border-soft -mt-3 mb-0" />
                <NodeBox node={child} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function RecursionTree() {
  const trace = useExecutionStore((s) => s.trace);
  if (!trace || trace.steps.length === 0) return null;

  const roots = buildRecursionTree(trace.steps);
  if (roots.length === 0) return null;

  return (
    <div className="flex gap-10 justify-center flex-wrap py-4 overflow-x-auto w-full">
      {roots.map((root) => (
        <NodeBox key={root.id} node={root} />
      ))}
    </div>
  );
}
