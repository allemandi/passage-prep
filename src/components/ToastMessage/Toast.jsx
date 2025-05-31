import { createContext, useCallback, useContext, useState } from "react";
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
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, variant = 'info', duration = 3000) => {
    setToast({ message, variant });

    setTimeout(() => setToast(null), duration);
  }, []);

  const hideToast = () => setToast(null);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast message={toast.message} variant={toast.variant} onDismiss={hideToast} />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context.showToast;
};

// Toast component
const Toast = ({ message, variant = "info", onDismiss }) => {
  const baseStyle = toastStyles[variant] || toastStyles.info;

  return (
    <div
      role="status"
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        px-5 py-3 rounded-2xl shadow-xl
        flex items-center gap-4
        max-w-sm w-[90%] sm:w-fit
        animate-fade-in-up
        ${baseStyle}
      `}
    >
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss toast"
        className="ml-auto p-1 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-gray-300"
      >
        <X size={18} />
      </button>
    </div>
  );
};
