import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast, { type ToastType } from '../components/Toast';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  detail?: string;
  duration?: number;
  icon?: React.ReactNode;
}

interface ToastContextValue {
  showToast: (options: ToastOptions | string, type?: ToastType, detail?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(null);

  const showToast = useCallback((options: ToastOptions | string, type?: ToastType, detail?: string) => {
    if (typeof options === 'string') {
      setToast({
        id: Date.now(),
        message: options,
        type: type || 'simple',
        detail,
        duration: 4000,
      });
    } else {
      setToast({
        id: Date.now(),
        duration: 4000,
        ...options,
      });
    }
  }, []);

  const handleClose = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          detail={toast.detail}
          duration={toast.duration}
          icon={toast.icon}
          onClose={handleClose}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
