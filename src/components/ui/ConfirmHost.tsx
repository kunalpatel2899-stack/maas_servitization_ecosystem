"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { subscribeConfirm, type ConfirmRequest } from "@/lib/confirm";
import { Button } from "./Button";

export function ConfirmHost() {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);

  useEffect(() => subscribeConfirm(setRequest), []);

  useEffect(() => {
    if (!request) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  if (!request) return null;

  const close = (result: boolean) => {
    request.resolve(result);
    setRequest(null);
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-ink-900/40 p-6 backdrop-blur-sm"
      onClick={() => close(false)}
    >
      <div
        className="w-full max-w-sm rounded-xl2 border border-surface-border bg-white p-5 shadow-lifted"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              request.danger ? "bg-status-critical/10 text-status-critical" : "bg-brand-blueLight text-brand-blue"
            }`}
          >
            <AlertTriangle size={17} />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-ink-900">{request.title}</h3>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">{request.message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => close(false)}>
            {request.cancelLabel ?? "Cancel"}
          </Button>
          <Button variant={request.danger ? "danger" : "primary"} onClick={() => close(true)}>
            {request.confirmLabel ?? "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  );
}
