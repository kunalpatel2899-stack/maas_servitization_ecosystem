// Imperative confirm-dialog bus, mirroring toast.ts. Replaces native
// window.confirm() with a themed modal: `await confirmAction({ title, message, danger })`
// resolves to true/false once the user responds, so call sites read almost
// identically to the native API they replace.

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export interface ConfirmRequest extends ConfirmOptions {
  id: string;
  resolve: (value: boolean) => void;
}

type Listener = (r: ConfirmRequest) => void;
const listeners = new Set<Listener>();

export function confirmAction(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const req: ConfirmRequest = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      resolve,
      ...options,
    };
    listeners.forEach((l) => l(req));
  });
}

export function subscribeConfirm(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
