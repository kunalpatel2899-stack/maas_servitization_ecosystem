"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { subscribeToast, type ToastMessage, type ToastVariant } from "@/lib/toast";

const ICONS: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const STYLES: Record<ToastVariant, string> = {
  success: "border-status-healthy/30 bg-status-healthy/10 text-status-healthy",
  error: "border-status-critical/30 bg-status-critical/10 text-status-critical",
  info: "border-brand-blue/30 bg-brand-blueLight text-brand-blue",
  warning: "border-status-warning/30 bg-status-warning/10 text-status-warning",
};

const AUTO_DISMISS_MS = 4500;

export function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return subscribeToast((msg) => {
      setToasts((prev) => [...prev, msg]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== msg.id));
      }, AUTO_DISMISS_MS);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex w-[340px] flex-col gap-2">
      {toasts.map((t) => {
        const Icon = ICONS[t.variant];
        return (
          <div
            key={t.id}
            className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-[12.5px] font-medium shadow-lifted ${STYLES[t.variant]}`}
          >
            <Icon size={16} className="mt-0.5 shrink-0" />
            <span className="flex-1 leading-snug text-ink-800">{t.text}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="text-ink-400 hover:text-ink-700"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
