import { useEffect } from "react";
import { Info, X } from "lucide-react";

const Toast = ({ message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex justify-center px-4">
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto flex w-full max-w-md animate-[toastSlideUp_320ms_ease-out] items-start gap-3 rounded-2xl border border-brand/20 bg-white/95 px-4 py-3 text-sm shadow-luxury backdrop-blur dark:border-slate-700 dark:bg-slate-800/95"
      >
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
          <Info className="h-4 w-4" />
        </span>
        <p className="flex-1 font-semibold leading-5 text-ink dark:text-slate-100">{message}</p>
        <button type="button" onClick={onClose} aria-label="Dismiss notification" className="shrink-0 text-muted transition hover:text-ink dark:text-slate-400 dark:hover:text-slate-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
