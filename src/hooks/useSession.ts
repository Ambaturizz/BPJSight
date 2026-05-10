import { useEffect, useState, useCallback, useRef } from "react";

export type Role = "patient" | "hospital";

export interface SessionUser {
  role: Role;
  name: string;
  loginAt: number;
  remember: boolean;
}

const KEY = "bpjsight.session";
const INACTIVITY_MS = 15 * 60 * 1000; // 15 min

export function readSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(KEY) || sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeSession(user: SessionUser) {
  const store = user.remember ? localStorage : sessionStorage;
  store.setItem(KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
}

export function useSession(onTimeout?: () => void) {
  const [session, setSession] = useState<SessionUser | null>(() => readSession());
  const lastActivity = useRef(Date.now());
  const cb = useRef(onTimeout);
  cb.current = onTimeout;

  const refresh = useCallback(() => setSession(readSession()), []);

  useEffect(() => {
    const bump = () => { lastActivity.current = Date.now(); };
    ["mousemove", "keydown", "click", "touchstart"].forEach(e =>
      window.addEventListener(e, bump, { passive: true })
    );
    const interval = setInterval(() => {
      if (!readSession()) return;
      if (Date.now() - lastActivity.current > INACTIVITY_MS) {
        clearSession();
        setSession(null);
        cb.current?.();
      }
    }, 30_000);
    return () => {
      clearInterval(interval);
      ["mousemove", "keydown", "click", "touchstart"].forEach(e =>
        window.removeEventListener(e, bump)
      );
    };
  }, []);

  return { session, refresh, setSession };
}
