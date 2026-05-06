import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ToastProvider, toast } from './Toast';

// Wrap any test that uses the `toast` singleton in a ToastProvider
const renderWithProvider = (ui: React.ReactNode = <></>) =>
  render(<ToastProvider>{ui}</ToastProvider>);

describe('ToastProvider + toast singleton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children', () => {
    renderWithProvider(<p>child content</p>);
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('toast.success shows a success message', async () => {
    renderWithProvider();
    act(() => toast.success('פעולה בוצעה'));
    expect(await screen.findByText('פעולה בוצעה')).toBeInTheDocument();
  });

  it('toast.error shows an error message', async () => {
    renderWithProvider();
    act(() => toast.error('שגיאה!'));
    expect(await screen.findByText('שגיאה!')).toBeInTheDocument();
  });

  it('toast.info shows an info message', async () => {
    renderWithProvider();
    act(() => toast.info('מידע חשוב'));
    expect(await screen.findByText('מידע חשוב')).toBeInTheDocument();
  });

  it('multiple toasts stack', async () => {
    renderWithProvider();
    act(() => {
      toast.success('הודעה 1');
      toast.error('הודעה 2');
    });
    expect(await screen.findByText('הודעה 1')).toBeInTheDocument();
    expect(screen.getByText('הודעה 2')).toBeInTheDocument();
  });

  it('auto-dismisses after 4 seconds', async () => {
    renderWithProvider();
    act(() => toast.success('הודעה זמנית'));
    expect(await screen.findByText('הודעה זמנית')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(4000));
    await waitFor(() =>
      expect(screen.queryByText('הודעה זמנית')).not.toBeInTheDocument(),
    );
  });

  it('manual dismiss via X button removes toast immediately', async () => {
    renderWithProvider();
    act(() => toast.success('נסגר ידנית'));
    expect(await screen.findByText('נסגר ידנית')).toBeInTheDocument();
    const closeBtn = screen.getByRole('button', { name: 'סגור הודעה' });
    await userEvent.click(closeBtn);
    expect(screen.queryByText('נסגר ידנית')).not.toBeInTheDocument();
  });

  it('toast does not appear without provider (no error thrown)', () => {
    // calling toast outside a provider should silently no-op
    expect(() => toast.success('ignored')).not.toThrow();
  });

  it('rendered inside document.body via portal', async () => {
    renderWithProvider();
    act(() => toast.info('portal test'));
    expect(await screen.findByText('portal test')).toBeInTheDocument();
    // the live region is portalled to body
    const liveRegion = document.body.querySelector('[aria-live="polite"]');
    expect(liveRegion).not.toBeNull();
  });
});
