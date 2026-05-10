import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ToastProvider } from '../components/ToastProvider';
import { api } from '../lib/api';
import type { AuthUser } from '../lib/auth';
import { Role } from '../lib/roles';
import { Approvals } from './Approvals';

// Mock the entire api module
vi.mock('../lib/api', () => ({
  api: {
    getAllRegistrations: vi.fn(),
    getTeamRegistrations: vi.fn(),
    getBranchRegistrations: vi.fn(),
    approveRegistrationTl: vi.fn(),
    approveRegistrationFinal: vi.fn(),
    prioritizeRegistration: vi.fn(),
    rejectRegistration: vi.fn(),
  },
}));

// Mock FileUpload - not relevant to these tests
vi.mock('../components/FileUpload', () => ({
  FileUpload: () => null,
}));

// Mock ScreenGuide
vi.mock('../components/ScreenGuide', () => ({
  ScreenGuide: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

const TL_USER = { id: 1, name: 'Test TL', role: Role.TEAM_LEADER, uniqueId: 'tl1' };
const BIS_USER = { id: 2, name: 'Test BIS', role: Role.BIS_CDR, uniqueId: 'bis1' };

const PENDING_TL_REG = {
  id: 10,
  status: 'PENDING_TL',
  user: { name: 'עמית כהן', branch: { name: 'ענף א' }, team: { name: 'צוות 1' } },
  courseInstance: { name: 'מחזור א', course: { name: 'קורס יסוד' } },
  coordPriority: null,
  coordNotes: null,
  bisNotes: null,
  rejectionReason: null,
};

const PENDING_BIS_REG = {
  id: 20,
  status: 'PENDING_BIS',
  user: { name: 'דנה לוי', branch: { name: 'ענף ב' }, team: { name: 'צוות 2' } },
  courseInstance: { name: 'מחזור ב', course: { name: 'קורס מתקדם' } },
  coordPriority: 2,
  coordNotes: null,
  bisNotes: null,
  rejectionReason: null,
};

const renderApprovals = (user = TL_USER) =>
  render(
    <ToastProvider>
      <Approvals user={user as AuthUser} />
    </ToastProvider>,
  );

describe('Approvals page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.getTeamRegistrations as ReturnType<typeof vi.fn>).mockResolvedValue([PENDING_TL_REG]);
    (api.getAllRegistrations as ReturnType<typeof vi.fn>).mockResolvedValue([PENDING_BIS_REG]);
    (api.approveRegistrationTl as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (api.approveRegistrationFinal as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (api.rejectRegistration as ReturnType<typeof vi.fn>).mockResolvedValue({});
  });

  it('shows loading state initially', () => {
    // make fetch hang
    (api.getTeamRegistrations as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    renderApprovals();
    // LoadingSpinner renders - just verify no cards yet
    expect(screen.queryByText('עמית כהן')).not.toBeInTheDocument();
  });

  it('renders registration cards after load', async () => {
    renderApprovals();
    expect(await screen.findByText('עמית כהן')).toBeInTheDocument();
    expect(screen.getByText('קורס יסוד')).toBeInTheDocument();
  });

  it('clicking אשר opens a modal (not inline)', async () => {
    renderApprovals();
    await screen.findByText('עמית כהן');

    await userEvent.click(screen.getByRole('button', { name: 'אשר' }));

    // dialog role must be present
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('אישור בקשה')).toBeInTheDocument();
  });

  it('clicking דחה opens a modal with reject title', async () => {
    renderApprovals();
    await screen.findByText('עמית כהן');

    await userEvent.click(screen.getByRole('button', { name: 'דחה' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('דחיית בקשה')).toBeInTheDocument();
  });

  it('reject submit is disabled when notes empty', async () => {
    renderApprovals();
    await screen.findByText('עמית כהן');
    await userEvent.click(screen.getByRole('button', { name: 'דחה' }));

    // find the submit button inside the dialog
    const dialog = screen.getByRole('dialog');
    const submitInDialog = dialog.querySelector('button:last-of-type') as HTMLButtonElement;
    expect(submitInDialog).toBeDisabled();
  });

  it('can type rejection reason and submit', async () => {
    renderApprovals();
    await screen.findByText('עמית כהן');
    await userEvent.click(screen.getByRole('button', { name: 'דחה' }));

    const textarea = screen.getByPlaceholderText('חובה לציין סיבה...');
    await userEvent.type(textarea, 'לא מתאים');

    // find submit button - it's the last button in the dialog
    const dialog = screen.getByRole('dialog');
    const buttons = dialog.querySelectorAll('button');
    const submitBtn = buttons[buttons.length - 1] as HTMLButtonElement;
    expect(submitBtn).not.toBeDisabled();

    await userEvent.click(submitBtn);
    await waitFor(() => expect(api.rejectRegistration).toHaveBeenCalledWith(10, 'לא מתאים'));
  });

  it('approve action calls correct api and closes modal', async () => {
    renderApprovals();
    await screen.findByText('עמית כהן');
    await userEvent.click(screen.getByRole('button', { name: 'אשר' }));

    const dialog = screen.getByRole('dialog');
    const buttons = dialog.querySelectorAll('button');
    const submitBtn = buttons[buttons.length - 1] as HTMLButtonElement;
    await userEvent.click(submitBtn);

    await waitFor(() => expect(api.approveRegistrationTl).toHaveBeenCalledWith(10, undefined));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('closing modal via X button dismisses it without submitting', async () => {
    renderApprovals();
    await screen.findByText('עמית כהן');
    await userEvent.click(screen.getByRole('button', { name: 'אשר' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'סגור' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(api.approveRegistrationTl).not.toHaveBeenCalled();
  });

  it('BIS_CDR sees final approve and reject buttons', async () => {
    renderApprovals(BIS_USER as AuthUser);
    expect(await screen.findByText('דנה לוי')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /אשר סופי/ })).toBeInTheDocument();
  });

  it('search filters cards by user name', async () => {
    (api.getTeamRegistrations as ReturnType<typeof vi.fn>).mockResolvedValue([
      PENDING_TL_REG,
      { ...PENDING_TL_REG, id: 11, user: { ...PENDING_TL_REG.user, name: 'נועה ברק' } },
    ]);
    renderApprovals();
    await screen.findByText('עמית כהן');
    expect(screen.getByText('נועה ברק')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('חיפוש לפי שם או קורס...');
    await userEvent.type(searchInput, 'נועה');

    expect(screen.queryByText('עמית כהן')).not.toBeInTheDocument();
    expect(screen.getByText('נועה ברק')).toBeInTheDocument();
  });

  it('empty filter state shows clear button', async () => {
    renderApprovals();
    await screen.findByText('עמית כהן');

    const searchInput = screen.getByPlaceholderText('חיפוש לפי שם או קורס...');
    await userEvent.type(searchInput, 'xyz_no_match');

    expect(await screen.findByRole('button', { name: 'נקה סינון' })).toBeInTheDocument();
  });
});
