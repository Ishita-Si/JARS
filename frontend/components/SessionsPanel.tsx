"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useExecutionStore } from "@/store/useExecutionStore";
import { api, SessionRecord } from "@/lib/api";

export default function SessionsPanel({ onClose }: { onClose: () => void }) {
  const token = useAuthStore((s) => s.token);
  const code = useExecutionStore((s) => s.code);
  const setCode = useExecutionStore((s) => s.setCode);
  const patterns = useExecutionStore((s) => s.patterns);

  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api
      .listSessions(token)
      .then(setSessions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSave() {
    if (!token || !title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const record = await api.saveSession(token, {
        title: title.trim(),
        code,
        language: "javascript",
        detected_patterns: patterns,
      });
      setSessions((prev) => [record, ...prev]);
      setTitle("");
    } catch (e: any) {
      setError(e.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!token) return;
    setSessions((prev) => prev.filter((s) => s.id !== id)); // optimistic
    try {
      await api.deleteSession(token, id);
    } catch (e: any) {
      setError(e.message ?? "Failed to delete");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-surface border border-border rounded-2xl p-5 shadow-2xl max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="font-display font-semibold text-sm">My Sessions</div>
          <button onClick={onClose} className="text-ink-faint hover:text-ink text-xs font-mono">
            close
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Name this visualization…"
            className="flex-1 bg-bg-2 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo transition"
          />
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="font-semibold text-xs px-3 py-2 rounded-lg bg-indigo-soft border border-indigo/40 text-[#c9c4ff] disabled:opacity-50 hover:border-indigo transition"
          >
            {saving ? "Saving…" : "Save current"}
          </button>
        </div>

        {error && <div className="text-coral text-xs font-mono mb-3">{error}</div>}

        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {loading && <div className="text-ink-faint text-xs font-mono">Loading…</div>}
          {!loading && sessions.length === 0 && (
            <div className="text-ink-faint text-xs font-mono">No saved sessions yet.</div>
          )}
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-2 bg-surface-2 border border-border-soft rounded-lg px-3 py-2"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{s.title}</div>
                <div className="text-[0.65rem] font-mono text-ink-faint truncate">
                  {s.detected_patterns || "no patterns detected"}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => {
                    setCode(s.code);
                    onClose();
                  }}
                  className="text-xs font-mono px-2 py-1 rounded-md border border-border hover:border-indigo transition"
                >
                  Load
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-xs font-mono px-2 py-1 rounded-md border border-border hover:border-coral hover:text-coral transition"
                >
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
