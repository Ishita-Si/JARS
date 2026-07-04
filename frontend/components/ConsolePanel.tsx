"use client";

import { useExecutionStore } from "@/store/useExecutionStore";

export default function ConsolePanel() {
  const currentStep = useExecutionStore((s) => s.currentStep());
  const trace = useExecutionStore((s) => s.trace);
  const patterns = useExecutionStore((s) => s.patterns);
  const parseError = useExecutionStore((s) => s.parseError);

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="text-center font-mono text-xs text-ink-dim min-h-[20px] px-4">
        {parseError ? (
          <span className="text-coral">{parseError}</span>
        ) : currentStep ? (
          <span dangerouslySetInnerHTML={{ __html: currentStep.message }} />
        ) : (
          "Press \u201cRun\u201d to execute your code."
        )}
      </div>

      {patterns.length > 0 && (
        <div className="flex gap-2 justify-center flex-wrap">
          {patterns.map((p) => (
            <span
              key={p}
              className="font-mono text-[0.65rem] px-2 py-1 rounded-full bg-indigo-soft border border-indigo/40 text-[#c9c4ff]"
            >
              {p}
            </span>
          ))}
        </div>
      )}

      <div className="bg-surface-2 border border-border-soft rounded-lg p-3 max-h-24 overflow-y-auto">
        <div className="font-mono text-[0.62rem] uppercase tracking-wider text-ink-faint mb-1">Console</div>
        {(currentStep?.consoleOutput.length ?? 0) === 0 && (
          <div className="font-mono text-xs text-ink-faint">No output yet</div>
        )}
        {currentStep?.consoleOutput.map((line, i) => (
          <div key={i} className="font-mono text-xs text-emerald">
            {"> "} {line}
          </div>
        ))}
      </div>

      {trace && (
        <div className="font-mono text-[0.68rem] text-ink-faint text-center">
          {trace.steps.length} steps traced
          {trace.error ? ` — stopped: ${trace.error}` : ""}
        </div>
      )}
    </div>
  );
}
