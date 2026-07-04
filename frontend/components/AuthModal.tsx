"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useAuthStore((s) => s.login);
  const signup = useAuthStore((s) => s.signup);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (mode === "login") await login(email, password);
      else await signup(email, password);
      onClose();
    } catch {
      // error already captured in store
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-surface border border-border rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-1 bg-bg-2 p-1 rounded-lg mb-5">
          <button
            className={`flex-1 text-sm font-medium py-1.5 rounded-md transition ${
              mode === "login" ? "bg-indigo-soft text-ink" : "text-ink-dim"
            }`}
            onClick={() => {
              setMode("login");
              clearError();
            }}
          >
            Log in
          </button>
          <button
            className={`flex-1 text-sm font-medium py-1.5 rounded-md transition ${
              mode === "signup" ? "bg-indigo-soft text-ink" : "text-ink-dim"
            }`}
            onClick={() => {
              setMode("signup");
              clearError();
            }}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-bg-2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo transition"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-bg-2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo transition"
          />

          {error && <div className="text-coral text-xs font-mono">{error}</div>}

          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-1 font-semibold text-sm py-2.5 rounded-lg bg-gradient-to-br from-indigo to-[#8f6bff] text-white disabled:opacity-60 hover:-translate-y-0.5 transition"
          >
            {status === "loading" ? "…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <button onClick={onClose} className="w-full text-center text-ink-faint text-xs font-mono mt-4 hover:text-ink-dim">
          cancel
        </button>
      </div>
    </div>
  );
}
