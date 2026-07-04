import { create } from "zustand";
import { Interpreter } from "@/lib/interpreter/interpreter";
import { detectPatterns, Pattern } from "@/lib/interpreter/detectPattern";
import { ExecutionTrace, TraceStep } from "@/lib/interpreter/types";

interface ExecutionState {
  code: string;
  trace: ExecutionTrace | null;
  patterns: Pattern[];
  currentIndex: number;
  playing: boolean;
  speedMs: number;
  parseError: string | null;

  setCode: (code: string) => void;
  runCode: () => void;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  restart: () => void;
  play: () => void;
  pause: () => void;
  setSpeed: (ms: number) => void;
  currentStep: () => TraceStep | null;
}

let playTimer: ReturnType<typeof setInterval> | null = null;

export const useExecutionStore = create<ExecutionState>((set, get) => ({
  code: "",
  trace: null,
  patterns: [],
  currentIndex: 0,
  playing: false,
  speedMs: 700,
  parseError: null,

  setCode: (code) => set({ code }),

  runCode: () => {
    const { code } = get();
    get().pause();
    try {
      const interpreter = new Interpreter(code);
      const trace = interpreter.run();
      const { patterns } = detectPatterns(code);
      set({ trace, patterns, currentIndex: 0, parseError: trace.error && trace.steps.length === 0 ? trace.error : null });
    } catch (e: any) {
      set({ trace: null, parseError: e.message ?? String(e) });
    }
  },

  goTo: (index) => {
    const { trace } = get();
    if (!trace) return;
    const clamped = Math.max(0, Math.min(trace.steps.length - 1, index));
    set({ currentIndex: clamped });
  },

  next: () => get().goTo(get().currentIndex + 1),
  prev: () => get().goTo(get().currentIndex - 1),
  restart: () => {
    get().pause();
    set({ currentIndex: 0 });
  },

  play: () => {
    const { trace } = get();
    if (!trace || trace.steps.length === 0) return;
    if (get().currentIndex >= trace.steps.length - 1) set({ currentIndex: 0 });
    set({ playing: true });
    if (playTimer) clearInterval(playTimer);
    playTimer = setInterval(() => {
      const { currentIndex, trace: t } = get();
      if (!t || currentIndex >= t.steps.length - 1) {
        get().pause();
        return;
      }
      set({ currentIndex: currentIndex + 1 });
    }, get().speedMs);
  },

  pause: () => {
    if (playTimer) clearInterval(playTimer);
    playTimer = null;
    set({ playing: false });
  },

  setSpeed: (ms) => {
    set({ speedMs: ms });
    if (get().playing) get().play();
  },

  currentStep: () => {
    const { trace, currentIndex } = get();
    if (!trace || trace.steps.length === 0) return null;
    return trace.steps[currentIndex] ?? null;
  },
}));
