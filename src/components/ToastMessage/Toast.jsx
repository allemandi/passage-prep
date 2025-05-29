import { createContext, useContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';

const ToastContext = createContext();

const toastStyles = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-yellow-500 text-black',
  info: 'bg-blue-600 text-white',
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, variant = 'info', duration = 3000) => {
    setToast({ message, variant });

    // Auto-dismiss
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
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context.showToast;
};



const Toast = ({ message, variant = 'info', onDismiss }) => {
  const style = toastStyles[variant] || toastStyles.info;

  return (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-3 w-fit max-w-sm ${style}`}
    >
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss toast"
        className="ml-auto rounded focus:outline-none focus:ring-2 focus:ring-white"
      >
        <X size={18} />
      </button>
    </div>
  );
};