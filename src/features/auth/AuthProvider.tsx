import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { authService } from "@/services/authService";
import type { AuthUser, UserRole } from "@/types/user";

const INACTIVITY_MS = 15 * 60 * 1000;

interface AuthContextValue {
  currentUser: AuthUser | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  status: "loading" | "authenticated" | "unauthenticated";
  login: (user: AuthUser) => void;
  updateCurrentUser: (patch: Partial<AuthUser>) => void;
  logout: () => Promise<void>;
  /** Backward compatibility untuk komponen lama. */
  signIn: (user: AuthUser) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children, onTimeout }: { children: ReactNode; onTimeout?: () => void }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastActivity = useRef(Date.now());
  const timeoutCallback = useRef(onTimeout);
  timeoutCallback.current = onTimeout;

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      setIsLoading(true);
      try {
        const sessionUser = await authService.getCurrentUser();
        if (isMounted) setCurrentUser(sessionUser);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback((user: AuthUser) => {
    setCurrentUser(user);
  }, []);

  const updateCurrentUser = useCallback((patch: Partial<AuthUser>) => {
    setCurrentUser((previous) => {
      if (!previous) return previous;

      const updatedUser = { ...previous, ...patch };
      authService.updateCurrentUser(updatedUser);
      return updatedUser;
    });
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setCurrentUser(null);
  }, []);

  useEffect(() => {
    const bumpActivity = () => {
      lastActivity.current = Date.now();
    };

    const events = ["mousemove", "keydown", "click", "touchstart"] as const;
    events.forEach((eventName) => window.addEventListener(eventName, bumpActivity, { passive: true }));

    const intervalId = window.setInterval(() => {
      if (!currentUser) return;

      if (Date.now() - lastActivity.current > INACTIVITY_MS) {
        void authService.logout();
        setCurrentUser(null);
        timeoutCallback.current?.();
      }
    }, 30_000);

    return () => {
      window.clearInterval(intervalId);
      events.forEach((eventName) => window.removeEventListener(eventName, bumpActivity));
    };
  }, [currentUser]);

  const value = useMemo<AuthContextValue>(() => {
    const isAuthenticated = Boolean(currentUser);
    const status: AuthContextValue["status"] = isLoading
      ? "loading"
      : isAuthenticated
        ? "authenticated"
        : "unauthenticated";

    return {
      currentUser,
      user: currentUser,
      isAuthenticated,
      isLoading,
      role: currentUser?.role ?? null,
      status,
      login,
      updateCurrentUser,
      logout,
      signIn: login,
      signOut: logout,
    };
  }, [currentUser, isLoading, login, updateCurrentUser, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }

  return context;
}




