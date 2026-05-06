import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { Modal } from './Modal';

describe('Modal', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('renders nothing when closed', () => {
    render(
      <Modal open={false} onClose={vi.fn()} title='Test'>
        <p>content</p>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('renders dialog with title and children when open', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title='כותרת'>
        <p>תוכן הדיאלוג</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('כותרת')).toBeInTheDocument();
    expect(screen.getByText('תוכן הדיאלוג')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title='Test'>
        <p>content</p>
      </Modal>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'סגור' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal open={true} onClose={onClose} title='Test'>
        <p>content</p>
      </Modal>,
    );
    // backdrop is aria-hidden div before the dialog card
    const backdrop = container.ownerDocument.querySelector('[aria-hidden="true"]');
    expect(backdrop).not.toBeNull();
    await userEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', async () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title='Test'>
        <p>content</p>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose on non-Escape keys', async () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title='Test'>
        <p>content</p>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('locks body scroll when open', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title='Test'>
        <p>content</p>
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when closed', () => {
    document.body.style.overflow = 'auto';
    const { rerender } = render(
      <Modal open={true} onClose={vi.fn()} title='Test'>
        <p>content</p>
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('hidden');
    rerender(
      <Modal open={false} onClose={vi.fn()} title='Test'>
        <p>content</p>
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('auto');
  });

  it('applies max-w-sm for size sm', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title='Test' size='sm'>
        <p>content</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('max-w-sm');
  });

  it('applies max-w-lg for size md (default)', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title='Test'>
        <p>content</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('max-w-lg');
  });

  it('renders via portal into document.body', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title='Test'>
        <p>portal-content</p>
      </Modal>,
    );
    // portal target is document.body, not the container
    expect(document.body).toHaveTextContent('portal-content');
  });

  it('does not register keydown listener when closed', () => {
    const onClose = vi.fn();
    render(
      <Modal open={false} onClose={onClose} title='Test'>
        <p>content</p>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('has aria-modal and aria-labelledby attributes', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title='My Title'>
        <p>content</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(screen.getByText('My Title').id).toBe('modal-title');
  });
});
