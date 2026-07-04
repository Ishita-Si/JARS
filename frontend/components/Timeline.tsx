"use client";

import { useExecutionStore } from "@/store/useExecutionStore";

const SPEEDS = [
  { label: "0.5×", ms: 1400 },
  { label: "1×", ms: 700 },
  { label: "2×", ms: 350 },
  { label: "4×", ms: 150 },
];

export default function Timeline() {
  const trace = useExecutionStore((s) => s.trace);
  const currentIndex = useExecutionStore((s) => s.currentIndex);
  const playing = useExecutionStore((s) => s.playing);
  const speedMs = useExecutionStore((s) => s.speedMs);
  const { goTo, next, prev, restart, play, pause, setSpeed } = useExecutionStore();

  const total = trace?.steps.length ?? 0;

  return (
    <div className="flex items-center gap-3 border-t border-border-soft px-5 py-3 flex-wrap">
      <button className="tl-btn" onClick={restart} title="Restart" disabled={!total}>
        ⟲
      </button>
      <button className="tl-btn" onClick={prev} title="Previous step" disabled={!total}>
        ◀
      </button>
      <button
        className="tl-btn bg-gradient-to-br from-indigo to-purple !border-transparent"
        onClick={() => (playing ? pause() : play())}
        title="Play / Pause"
        disabled={!total}
      >
        {playing ? "❚❚" : "▶"}
      </button>
      <button className="tl-btn" onClick={next} title="Next step" disabled={!total}>
        ▶
      </button>

      <input
        type="range"
        min={0}
        max={Math.max(total - 1, 0)}
        value={currentIndex}
        onChange={(e) => goTo(parseInt(e.target.value, 10))}
        disabled={!total}
        className="flex-1 min-w-[120px] accent-cyan"
      />

      <div className="font-mono text-xs text-ink-faint whitespace-nowrap">
        step {total ? currentIndex + 1 : 0} / {total}
      </div>

      <select
        className="font-mono text-xs bg-surface-2 text-ink-dim border border-border rounded-lg px-2 py-1.5 cursor-pointer"
        value={speedMs}
        onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
      >
        {SPEEDS.map((s) => (
          <option key={s.ms} value={s.ms}>
            {s.label}
          </option>
        ))}
      </select>

      <style jsx>{`
        .tl-btn {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: #17171f;
          border: 1px solid #232330;
          color: #e9e9ef;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.15s;
          flex-shrink: 0;
          font-size: 12px;
        }
        .tl-btn:hover:not(:disabled) {
          border-color: #6d63ff;
        }
        .tl-btn:disabled {
          opacity: 0.4;
          cursor: default;
        }
      `}</style>
    </div>
  );
}
