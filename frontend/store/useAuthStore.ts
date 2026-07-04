import { create } from "zustand";
import { api, ApiError, User } from "@/lib/api";

const TOKEN_KEY = "jars_token";

interface AuthState {
  token: string | null;
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "error";
  error: string | null;

  hydrate: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  status: "idle",
  error: null,

  // Reads a previously-saved token from localStorage and fetches the user.
  // Called from a client-only effect — never at module init, to avoid SSR/hydration mismatches.
  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    set({ token, status: "loading" });
    api
      .me(token)
      .then((user) => set({ user, status: "authenticated" }))
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        set({ token: null, user: null, status: "idle" });
      });
  },

  login: async (email, password) => {
    set({ status: "loading", error: null });
    try {
      const { access_token } = await api.login(email, password);
      const user = await api.me(access_token);
      if (typeof window !== "undefined") window.localStorage.setItem(TOKEN_KEY, access_token);
      set({ token: access_token, user, status: "authenticated" });
    } catch (e) {
      set({ status: "error", error: e instanceof ApiError ? e.message : "Login failed" });
      throw e;
    }
  },

  signup: async (email, password) => {
    set({ status: "loading", error: null });
    try {
      await api.signup(email, password);
      await get().login(email, password);
    } catch (e) {
      set({ status: "error", error: e instanceof ApiError ? e.message : "Signup failed" });
      throw e;
    }
  },

  logout: () => {
    if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null, status: "idle" });
  },

  clearError: () => set({ error: null }),
}));
