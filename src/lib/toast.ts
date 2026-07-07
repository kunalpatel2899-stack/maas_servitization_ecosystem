// Lightweight pub-sub toast bus. Avoids prop-drilling / context wiring across
// the many independent client-component pages — any component can call
// `toast.success(...)` and the single <Toaster /> mounted in the root layout
// picks it up.

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  variant: ToastVariant;
  text: string;
}

type Listener = (t: ToastMessage) => void;
const listeners = new Set<Listener>();

function emit(variant: ToastVariant, text: string) {
  const msg: ToastMessage = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, variant, text };
  listeners.forEach((l) => l(msg));
}

export const toast = {
  success: (text: string) => emit("success", text),
  error: (text: string) => emit("error", text),
  info: (text: string) => emit("info", text),
  warning: (text: string) => emit("warning", text),
};

export function subscribeToast(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
