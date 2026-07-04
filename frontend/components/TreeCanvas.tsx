"use client";

import { useExecutionStore } from "@/store/useExecutionStore";
import { findTreeVar, toTreeDisplay, TreeDisplayNode } from "@/lib/visualization/deriveStructures";

function NodeBox({ node }: { node: TreeDisplayNode }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 rounded-full border border-purple/40 bg-purple/10 flex items-center justify-center font-mono font-semibold text-sm">
        {String(node.value)}
      </div>
      {(node.left || node.right) && (
        <>
          <div className="w-px h-3 bg-border-soft" />
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              {node.left ? (
                <NodeBox node={node.left} />
              ) : (
                <div className="w-8 h-8 rounded-full border border-dashed border-border-soft opacity-40" />
              )}
            </div>
            <div className="flex flex-col items-center">
              {node.right ? (
                <NodeBox node={node.right} />
              ) : (
                <div className="w-8 h-8 rounded-full border border-dashed border-border-soft opacity-40" />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function TreeCanvas() {
  const step = useExecutionStore((s) => s.currentStep());
  if (!step) return null;

  const trees = findTreeVar(step.scope);
  if (trees.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 items-center py-4 w-full overflow-x-auto">
      {trees.map(([key, root]) => {
        const display = toTreeDisplay(root);
        if (!display) return null;
        return (
          <div key={key} className="flex flex-col items-center gap-3">
            <div className="font-mono text-[0.68rem] text-ink-faint uppercase tracking-wider">{key}</div>
            <NodeBox node={display} />
          </div>
        );
      })}
    </div>
  );
}
