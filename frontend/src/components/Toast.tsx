import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'info';

type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastContextType = {
  addToast: (type: ToastType, message: string) => void;
};

export const ToastContext = createContext<ToastContextType>({
  addToast: () => {},
});

let _addToast: ((type: ToastType, message: string) => void) | null = null;

export const toast = {
  success: (message: string) => _addToast?.('success', message),
  error: (message: string) => _addToast?.('error', message),
  info: (message: string) => _addToast?.('info', message),
};

const ICON: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={16} className='shrink-0 text-emerald-500' />,
  error: <XCircle size={16} className='shrink-0 text-red-500' />,
  info: <Info size={16} className='shrink-0 text-blue-500' />,
};

const BG: Record<ToastType, string> = {
  success: 'border-emerald-200 bg-emerald-50',
  error: 'border-red-200 bg-red-50',
  info: 'border-blue-200 bg-blue-50',
};

const TEXT: Record<ToastType, string> = {
  success: 'text-emerald-800',
  error: 'text-red-800',
  info: 'text-blue-800',
};

const AUTO_DISMISS_MS = 4000;

let nextId = 1;

const ToastList = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const add = useCallback(
    (type: ToastType, message: string) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, type, message }]);
      const timer = setTimeout(() => remove(id), AUTO_DISMISS_MS);
      timers.current.set(id, timer);
    },
    [remove],
  );

  // Expose add to the singleton toast helper
  useEffect(() => {
    _addToast = add;
    return () => {
      _addToast = null;
    };
  }, [add]);

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      aria-live='polite'
      role='status'
      className='fixed bottom-4 left-4 z-[100] flex flex-col gap-2'
      style={{ direction: 'rtl' }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex min-w-[220px] max-w-xs items-start gap-2 rounded-xl border px-3 py-2.5 shadow-md ${BG[t.type]}`}
          style={{ animation: 'toast-in 200ms ease-out' }}
        >
          {ICON[t.type]}
          <span className={`flex-1 text-xs font-medium leading-snug ${TEXT[t.type]}`}>
            {t.message}
          </span>
          <button
            type='button'
            onClick={() => remove(t.id)}
            className='shrink-0 rounded p-0.5 text-current opacity-60 transition-opacity hover:opacity-100'
            aria-label='סגור הודעה'
          >
            <X size={13} />
          </button>
        </div>
      ))}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>,
    document.body,
  );
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastContext.Provider value={{ addToast: () => {} }}>
      {children}
      <ToastList />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
