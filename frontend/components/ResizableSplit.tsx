"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ResizableSplitProps {
  /** "horizontal" = panes sit side-by-side, divider drags left/right.
   *  "vertical"   = panes stack top/bottom, divider drags up/down. */
  direction: "horizontal" | "vertical";
  /** Initial size of the first pane, as a percentage of the container. */
  defaultSize: number;
  /** Percentage bounds so neither pane can be dragged to nothing. */
  min?: number;
  max?: number;
  first: React.ReactNode;
  second: React.ReactNode;
  className?: string;
}

/**
 * A minimal, dependency-free resizable split pane. Percentage-based so it
 * adapts to the parent's size; drag the divider to reallocate space
 * between the two panes, double-click it to reset to the default split.
 */
export default function ResizableSplit({
  direction,
  defaultSize,
  min = 20,
  max = 80,
  first,
  second,
  className = "",
}: ResizableSplitProps) {
  const [size, setSize] = useState(defaultSize);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const isHorizontal = direction === "horizontal";

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const raw = isHorizontal
        ? ((e.clientX - rect.left) / rect.width) * 100
        : ((e.clientY - rect.top) / rect.height) * 100;
      setSize(Math.min(max, Math.max(min, raw)));
    },
    [isHorizontal, min, max]
  );

  const stopDragging = useCallback(() => {
    draggingRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", stopDragging);
  }, [onPointerMove]);

  const startDragging = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      draggingRef.current = true;
      document.body.style.cursor = isHorizontal ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", stopDragging);
    },
    [isHorizontal, onPointerMove, stopDragging]
  );

  // Safety net: if the component unmounts mid-drag, clean up global listeners/cursor.
  useEffect(() => () => stopDragging(), [stopDragging]);

  return (
    <div ref={containerRef} className={`flex ${isHorizontal ? "flex-row" : "flex-col"} w-full h-full min-h-0 min-w-0 ${className}`}>
      <div style={{ [isHorizontal ? "width" : "height"]: `${size}%` }} className="min-h-0 min-w-0 overflow-hidden shrink-0">
        {first}
      </div>

      <div
        onPointerDown={startDragging}
        onDoubleClick={() => setSize(defaultSize)}
        title="Drag to resize · double-click to reset"
        className={`group relative shrink-0 flex items-center justify-center bg-border-soft hover:bg-indigo/50 active:bg-indigo transition-colors z-10 ${
          isHorizontal ? "w-1.5 cursor-col-resize" : "h-1.5 cursor-row-resize"
        }`}
      >
        <div
          className={`absolute rounded-full bg-ink-faint/50 group-hover:bg-white transition-colors ${
            isHorizontal ? "w-0.5 h-8" : "h-0.5 w-8"
          }`}
        />
      </div>

      <div style={{ [isHorizontal ? "width" : "height"]: `${100 - size}%` }} className="min-h-0 min-w-0 overflow-hidden flex-1">
        {second}
      </div>
    </div>
  );
}
