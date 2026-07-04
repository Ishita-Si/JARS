"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useExecutionStore } from "@/store/useExecutionStore";
import { api, ApiError } from "@/lib/api";

export default function AskJarsPanel() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const code = useExecutionStore((s) => s.code);
  const currentStep = useExecutionStore((s) => s.currentStep());

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask() {
    if (!token || !question.trim()) return;
    setAsking(true);
    setError(null);
    setAnswer(null);
    try {
      const result = await api.getInsight(token, {
        code,
        question: question.trim(),
        current_line: currentStep?.line ?? null,
        scope_snapshot: currentStep?.scope ?? null,
      });
      setAnswer(result.answer);
    } catch (e) {
      if (e instanceof ApiError && e.status === 503) {
        setError("AI insights aren't configured on this server yet — add ANTHROPIC_API_KEY to backend/.env.");
      } else {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    } finally {
      setAsking(false);
    }
  }

  if (!user) {
    return (
      <div className="bg-surface-2 border border-border-soft rounded-lg p-3 text-center">
        <div className="font-mono text-[0.62rem] uppercase tracking-wider text-ink-faint mb-1">Ask JARS</div>
        <div className="text-xs text-ink-faint">Log in to ask why your code did what it did.</div>
      </div>
    );
  }

  return (
    <div className="bg-surface-2 border border-border-soft rounded-lg p-3 w-full">
      <div className="font-mono text-[0.62rem] uppercase tracking-wider text-ink-faint mb-2">Ask JARS</div>
      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Why did this variable change?"
          className="flex-1 bg-bg-2 border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-indigo transition"
        />
        <button
          onClick={ask}
          disabled={asking || !question.trim()}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-soft border border-indigo/40 text-[#c9c4ff] disabled:opacity-50 hover:border-indigo transition"
        >
          {asking ? "…" : "Ask"}
        </button>
      </div>
      {error && <div className="text-coral text-xs font-mono mt-2">{error}</div>}
      {answer && <div className="text-xs text-ink mt-2 leading-relaxed">{answer}</div>}
    </div>
  );
}
