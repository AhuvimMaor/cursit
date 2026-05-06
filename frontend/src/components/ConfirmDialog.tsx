import { Modal } from './Modal';

type ConfirmDialogProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'default';
};

export const ConfirmDialog = ({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'אישור',
  variant = 'default',
}: ConfirmDialogProps) => {
  const confirmClass =
    variant === 'danger'
      ? 'bg-red-500 hover:bg-red-600 text-white'
      : 'bg-primary hover:bg-primary/90 text-white';

  return (
    <Modal open={open} onClose={onCancel} title={title} size='sm'>
      <p className='text-sm text-muted-foreground'>{message}</p>
      <div className='mt-5 flex justify-end gap-2'>
        <button
          type='button'
          onClick={onCancel}
          className='rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted'
        >
          ביטול
        </button>
        <button
          type='button'
          onClick={onConfirm}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${confirmClass}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
