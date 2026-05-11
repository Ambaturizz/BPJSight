import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AuthUser, Role } from "@/types/user";

const STORAGE_KEY = "bpjsight.session";
const INACTIVITY_MS = 15 * 60 * 1000;

interface AuthContextValue {
  user: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: (user: Omit<AuthUser, "loginAt">) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function clearStoredUser() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children, onTimeout }: { children: ReactNode; onTimeout?: () => void }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const lastActivity = useRef(Date.now());
  const timeoutCb = useRef(onTimeout);
  timeoutCb.current = onTimeout;

  const signIn = useCallback((u: Omit<AuthUser, "loginAt">) => {
    const full: AuthUser = { ...u, loginAt: Date.now() };
    const store = full.remember ? localStorage : sessionStorage;
    store.setItem(STORAGE_KEY, JSON.stringify(full));
    setUser(full);
  }, []);

  const signOut = useCallback(() => {
    clearStoredUser();
    setUser(null);
  }, []);

  useEffect(() => {
    const bump = () => { lastActivity.current = Date.now(); };
    const events = ["mousemove", "keydown", "click", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const i = setInterval(() => {
      if (!user) return;
      if (Date.now() - lastActivity.current > INACTIVITY_MS) {
        clearStoredUser();
        setUser(null);
        timeoutCb.current?.();
      }
    }, 30_000);
    return () => {
      clearInterval(i);
      events.forEach((e) => window.removeEventListener(e, bump));
    };
  }, [user]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    status: !ready ? "loading" : user ? "authenticated" : "unauthenticated",
    signIn,
    signOut,
  }), [user, ready, signIn, signOut]);

  // suppress lint
  void setReady;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export type { Role };
