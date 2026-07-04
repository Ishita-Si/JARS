"use client";

import { useExecutionStore } from "@/store/useExecutionStore";
import { hasRecursion } from "@/lib/visualization/buildRecursionTree";
import RecursionTree from "@/components/RecursionTree";
import ArrayCanvas from "@/components/ArrayCanvas";
import HashMapCanvas from "@/components/HashMapCanvas";
import DPTableCanvas from "@/components/DPTableCanvas";
import LinkedListCanvas from "@/components/LinkedListCanvas";
import TreeCanvas from "@/components/TreeCanvas";
import GraphCanvas from "@/components/GraphCanvas";

export default function VisualizationCanvas() {
  const trace = useExecutionStore((s) => s.trace);

  if (!trace || trace.steps.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-ink-faint font-mono text-xs">
        Run your code to see it visualized here.
      </div>
    );
  }

  const showRecursion = hasRecursion(trace.steps);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 py-4 overflow-auto">
      {showRecursion && <RecursionTree />}
      <TreeCanvas />
      <LinkedListCanvas />
      <GraphCanvas />
      <DPTableCanvas />
      <ArrayCanvas />
      <HashMapCanvas />
      {!showRecursion && <ArrayFallbackHint />}
    </div>
  );
}

function ArrayFallbackHint() {
  const step = useExecutionStore((s) => s.currentStep());
  if (!step) return null;
  const hasArray = Object.values(step.scope).some((v) => Array.isArray(v));
  const hasObject = Object.values(step.scope).some((v) => typeof v === "object" && v !== null && !Array.isArray(v));
  if (hasArray || hasObject) return null;
  return (
    <div className="text-center text-ink-faint font-mono text-xs px-6">
      No array, object, or recursion detected yet in scope — check the Variables panel for scalar state.
    </div>
  );
}
