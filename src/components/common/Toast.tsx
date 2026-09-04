import React from "react";
import { useApp } from "../../context/AppContext";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border shadow-xl transition-all duration-300 ${
            toast.type === "success"
              ? "bg-neutral-900 text-white border-neutral-800"
              : toast.type === "error"
              ? "bg-rose-900 text-white border-rose-800"
              : "bg-neutral-800 text-white border-neutral-700"
          }`}
        >
          <div className="flex items-center gap-3">
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toast.type === "info" && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
            <p className="text-sm font-medium tracking-tight leading-snug">{toast.message}</p>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors ml-3"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export const Toast = ToastContainer;

