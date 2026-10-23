import React, {
  createContext, useContext, useMemo, useState, ReactNode,
} from 'react';

export interface ToastContent {
  message: string;
  action?: { label: string; href?: string; onClick?: () => void };
}

interface ToastContextValue {
  toastContent: ToastContent | null;
  setToastContent: (toast: ToastContent | null) => void;
  isToastOpen: boolean;
  openToast: () => void;
  closeToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toastContent, setToastContent] = useState<ToastContent | null>(null);
  const [isToastOpen, setIsToastOpen] = useState(false);

  const value = useMemo<ToastContextValue>(() => ({
    toastContent,
    setToastContent,
    isToastOpen,
    openToast: () => setIsToastOpen(true),
    closeToast: () => setIsToastOpen(false),
  }), [toastContent, isToastOpen]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
