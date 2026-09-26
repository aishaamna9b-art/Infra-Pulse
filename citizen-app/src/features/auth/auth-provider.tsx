"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, readSession, writeSession, type CitizenSession } from "./session";

const PROTECTED_PREFIXES = ["/home", "/report", "/reports", "/account", "/help", "/admin"];

type AuthContextValue = {
  session: CitizenSession | null;
  ready: boolean;
  signIn: (session: Omit<CitizenSession, "authenticatedAt">) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<CitizenSession | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setSession(readSession());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const needsAuth = PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
    if (needsAuth && !session) {
      router.replace("/login");
    }
  }, [pathname, ready, router, session]);

  const signIn = useCallback((next: Omit<CitizenSession, "authenticatedAt">) => {
    const value: CitizenSession = { ...next, authenticatedAt: Date.now() };
    writeSession(value);
    setSession(value);
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    setSession(null);
    router.replace("/");
  }, [router]);

  const value = useMemo(
    () => ({ session, ready, signIn, signOut }),
    [ready, session, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
