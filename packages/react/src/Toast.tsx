"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Button } from "./Button";
import { recipe, type VariantProps } from "./recipe";
import styles from "./Toast.module.css";

const toastRecipe = recipe({
  base: styles.toast,
  variants: {
    variant: {
      success: styles.success,
      error: styles.error,
    },
  },
});

type ToastVariants = VariantProps<{
  variant: { success: string; error: string };
}>;

export type ToastVariant = NonNullable<ToastVariants["variant"]>;

export interface ToastMessage {
  /** Stable identifier used for updates, dismissal, and tests. */
  id: string;
  /** Semantic feedback treatment. */
  variant: ToastVariant;
  /** Primary feedback text. */
  title: ReactNode;
  /** Optional supporting text. */
  description?: ReactNode;
  /** Auto-dismiss delay in milliseconds. Set to `null` to keep it open. */
  duration?: number | null;
  /** Accessible label for the manual dismiss button. @default "Dismiss notification" */
  dismissLabel?: string;
}

export interface ToastOptions extends Omit<ToastMessage, "id"> {
  /** Optional caller-owned id. Generated when omitted. */
  id?: string;
}

export interface ToastProviderProps {
  children: ReactNode;
  /** Default auto-dismiss delay for toasts that do not specify one. @default 5000 */
  defaultDuration?: number;
  /** Initial toasts, useful for deterministic visual fixtures. */
  defaultToasts?: ToastMessage[];
}

export interface ToastApi {
  show: (toast: ToastOptions) => string;
  success: (toast: Omit<ToastOptions, "variant">) => string;
  error: (toast: Omit<ToastOptions, "variant">) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

interface ToastRegionContextValue {
  toasts: ToastMessage[];
  dismiss: (id: string) => void;
}

const ToastApiContext = createContext<ToastApi | null>(null);
const ToastRegionContext = createContext<ToastRegionContextValue | null>(null);

let toastId = 0;

function nextToastId() {
  toastId += 1;
  return `cedar-toast-${toastId}`;
}

/**
 * Provides a small toast queue for transient success and error feedback.
 *
 * Render one {@link Toast.Region} inside the provider, then call
 * {@link useToast} from descendants to enqueue feedback. Toasts auto-dismiss by
 * default, can be dismissed manually, and are announced politely through the
 * region's `role="status"` items.
 *
 * @example
 * <Toast.Provider>
 *   <App />
 *   <Toast.Region />
 * </Toast.Provider>
 */
function Provider({
  children,
  defaultDuration = 5000,
  defaultToasts = [],
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>(() =>
    defaultToasts.map((toast) => ({
      ...toast,
      duration: toast.duration === undefined ? defaultDuration : toast.duration,
    })),
  );

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const clear = useCallback(() => {
    setToasts([]);
  }, []);

  const show = useCallback(
    ({ id = nextToastId(), duration, ...toast }: ToastOptions) => {
      const message: ToastMessage = {
        id,
        duration: duration === undefined ? defaultDuration : duration,
        ...toast,
      };

      setToasts((current) => [
        ...current.filter((existing) => existing.id !== id),
        message,
      ]);

      return id;
    },
    [defaultDuration],
  );

  const success = useCallback(
    (toast: Omit<ToastOptions, "variant">) =>
      show({ ...toast, variant: "success" }),
    [show],
  );

  const error = useCallback(
    (toast: Omit<ToastOptions, "variant">) =>
      show({ ...toast, variant: "error" }),
    [show],
  );

  const api = useMemo<ToastApi>(
    () => ({ show, success, error, dismiss, clear }),
    [clear, dismiss, error, show, success],
  );

  const region = useMemo<ToastRegionContextValue>(
    () => ({ toasts, dismiss }),
    [dismiss, toasts],
  );

  return (
    <ToastApiContext.Provider value={api}>
      <ToastRegionContext.Provider value={region}>
        {children}
      </ToastRegionContext.Provider>
    </ToastApiContext.Provider>
  );
}

/**
 * Access the nearest toast queue.
 *
 * `success` and `error` are convenience wrappers around `show`; all methods
 * return or accept the toast id so product code can replace or dismiss a
 * specific notification.
 */
export function useToast(): ToastApi {
  const context = useContext(ToastApiContext);

  if (!context) {
    throw new Error("useToast must be used inside Toast.Provider.");
  }

  return context;
}

export interface ToastRegionProps extends HTMLAttributes<HTMLOListElement> {
  /** Accessible label for the notification stack. @default "Notifications" */
  "aria-label"?: string;
}

/**
 * Fixed notification stack. Items are rendered newest-last and announced with
 * polite live-region semantics so they do not interrupt the current task.
 */
const Region = forwardRef<HTMLOListElement, ToastRegionProps>(function Region(
  { className, "aria-label": ariaLabel = "Notifications", ...props },
  ref,
) {
  const context = useContext(ToastRegionContext);

  if (!context) {
    throw new Error("Toast.Region must be used inside Toast.Provider.");
  }

  return (
    <ol
      ref={ref}
      aria-label={ariaLabel}
      className={className ? `${styles.region} ${className}` : styles.region}
      {...props}
    >
      {context.toasts.map((toast) => (
        <li key={toast.id} className={styles.item}>
          <ToastItem toast={toast} onDismiss={context.dismiss} />
        </li>
      ))}
    </ol>
  );
});

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  useEffect(() => {
    if (toast.duration === null) {
      return undefined;
    }

    const timeout = window.setTimeout(
      () => onDismiss(toast.id),
      Math.max(0, toast.duration ?? 5000),
    );

    return () => window.clearTimeout(timeout);
  }, [onDismiss, toast.duration, toast.id]);

  const { className, dataAttrs } = toastRecipe({ variant: toast.variant });

  return (
    <div className={className} {...dataAttrs}>
      <div
        className={styles.content}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className={styles.title}>{toast.title}</div>
        {toast.description ? (
          <div className={styles.description}>{toast.description}</div>
        ) : null}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className={styles.dismiss}
        aria-label={toast.dismissLabel ?? "Dismiss notification"}
        onPress={() => onDismiss(toast.id)}
      >
        <span aria-hidden="true">×</span>
      </Button>
    </div>
  );
}

/** Compound toast API. Pair with the named {@link useToast} hook. */
export const Toast = { Provider, Region };
