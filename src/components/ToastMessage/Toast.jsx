import { createContext, useCallback, useContext, useState, useEffect, memo } from "react";
import { X } from "lucide-react";

const toastStyles = {
  success: 'bg-green-600 text-white dark:bg-green-500',
  error: 'bg-red-600 text-white dark:bg-red-500',
  warning: 'bg-yellow-400 text-black dark:bg-yellow-300',
  info: 'bg-sky-600 text-white dark:bg-sky-500',
};

// Toast context
const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, variant = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, variant, duration }]);
  }, []);

  const hideToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 items-center pointer-events-none"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            variant={toast.variant}
            duration={toast.duration}
            onDismiss={hideToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context.showToast;
};

// Toast component
const Toast = memo(({ id, message, variant = "info", duration, onDismiss }) => {
  const baseStyle = toastStyles[variant] || toastStyles.info;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <div
      role="status"
      className={`
        pointer-events-auto
        px-5 py-3 rounded-2xl shadow-xl
        flex items-center gap-4
        max-w-sm w-full sm:w-fit
        animate-fade-in-up
        ${baseStyle}
        transition-all duration-300
      `}
    >
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => onDismiss(id)}
        aria-label="Dismiss toast"
        className="ml-auto p-1 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-gray-300"
      >
        <X size={18} />
      </button>
    </div>
  );
});

Toast.displayName = 'Toast';
