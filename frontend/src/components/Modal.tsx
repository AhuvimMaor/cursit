import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

export const Modal = ({ open, onClose, title, children, size = 'md' }: ModalProps) => {
  const firstInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    // Prevent body scroll while modal is open
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Auto-focus first focusable element
    const timer = setTimeout(() => {
      const focusable = firstInputRef.current?.querySelector<HTMLElement>(
        'input, textarea, select, button:not([data-modal-close])',
      );
      focusable?.focus();
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prev;
      clearTimeout(timer);
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxWidth =
    size === 'sm'
      ? 'max-w-sm'
      : size === 'lg'
        ? 'max-w-3xl'
        : size === 'xl'
          ? 'max-w-5xl'
          : 'max-w-lg';

  return createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
      style={{ animation: 'modal-fade-in 150ms ease-out' }}
    >
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/40 backdrop-blur-sm'
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Card */}
      <div
        ref={firstInputRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby='modal-title'
        className={`relative z-10 w-full ${maxWidth} rounded-2xl border border-border bg-white shadow-xl`}
        style={{ animation: 'modal-scale-in 150ms ease-out' }}
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-border px-5 py-4'>
          <h2 id='modal-title' className='text-sm font-semibold text-foreground'>
            {title}
          </h2>
          <button
            type='button'
            data-modal-close='true'
            onClick={onClose}
            className='rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            aria-label='סגור'
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className='max-h-[75vh] overflow-y-auto px-5 py-4'>{children}</div>
      </div>

      <style>{`
        @keyframes modal-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modal-scale-in {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body,
  );
};
