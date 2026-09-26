"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

export type ToastTone = "neutral" | "success" | "danger";

type Toast = {
  id: number;
  title: string;
  tone: ToastTone;
};

type ToastContextValue = {
  notify: (toast: { title: string; tone?: ToastTone }) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((toast: { title: string; tone?: ToastTone }) => {
    const id = Date.now();
    setToasts((current) => [...current, { id, title: toast.title, tone: toast.tone ?? "neutral" }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <p
            key={toast.id}
            role="status"
            className={cn(
              "pointer-events-auto max-w-md rounded-full px-4 py-2 text-sm font-semibold shadow-lg",
              toast.tone === "success" && "bg-teal-800 text-white",
              toast.tone === "danger" && "bg-red-700 text-white",
              toast.tone === "neutral" && "bg-ink text-paper",
            )}
          >
            {toast.title}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
