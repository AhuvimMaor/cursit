import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { ConfirmDialog } from './ConfirmDialog';

const defaults = {
  open: true,
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
  title: 'אישור פעולה',
  message: 'האם אתה בטוח?',
};

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    render(<ConfirmDialog {...defaults} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows title and message when open', () => {
    render(<ConfirmDialog {...defaults} />);
    expect(screen.getByText('אישור פעולה')).toBeInTheDocument();
    expect(screen.getByText('האם אתה בטוח?')).toBeInTheDocument();
  });

  it('shows default confirmLabel "אישור"', () => {
    render(<ConfirmDialog {...defaults} />);
    expect(screen.getByRole('button', { name: 'אישור' })).toBeInTheDocument();
  });

  it('shows custom confirmLabel', () => {
    render(<ConfirmDialog {...defaults} confirmLabel='מחק' />);
    expect(screen.getByRole('button', { name: 'מחק' })).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button clicked', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...defaults} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole('button', { name: 'אישור' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button clicked', async () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...defaults} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'ביטול' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when Escape pressed', async () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...defaults} onCancel={onCancel} />);
    await userEvent.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('danger variant: confirm button has red bg class', () => {
    render(<ConfirmDialog {...defaults} variant='danger' confirmLabel='מחק' />);
    const btn = screen.getByRole('button', { name: 'מחק' });
    expect(btn.className).toContain('bg-red-500');
  });

  it('default variant: confirm button has primary bg class', () => {
    render(<ConfirmDialog {...defaults} variant='default' />);
    const btn = screen.getByRole('button', { name: 'אישור' });
    expect(btn.className).toContain('bg-primary');
  });
});
