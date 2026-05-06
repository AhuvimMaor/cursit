import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ToastProvider } from '../components/ToastProvider';
import { api } from '../lib/api';
import { Role } from '../lib/roles';
import { Candidacy } from './Candidacy';

vi.mock('../lib/api', () => ({
  api: {
    getAllCandidacies: vi.fn(),
    getBranchCandidacies: vi.fn(),
    getMyCandidacySubmissions: vi.fn(),
    approveCandidacy: vi.fn(),
    rejectCandidacy: vi.fn(),
    coordReviewCandidacy: vi.fn(),
    getUsers: vi.fn(),
    getTeamMembers: vi.fn(),
    getCourses: vi.fn(),
    submitCandidacy: vi.fn(),
  },
}));

vi.mock('../components/ScreenGuide', () => ({
  ScreenGuide: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

const BIS_USER = { id: 1, name: 'BIS Admin', role: Role.BIS_CDR, uniqueId: 'bis1' };
const TL_USER = { id: 2, name: 'TL User', role: Role.TEAM_LEADER, uniqueId: 'tl1', teamId: 5 };
const TRAINEE_USER = { id: 3, name: 'Trainee', role: Role.TRAINEE, uniqueId: 'tr1' };

const PENDING_CANDIDACY = {
  id: 100,
  status: 'PENDING',
  candidate: { name: 'יוסי מזרחי', team: { name: 'צוות אלפא' } },
  courseInstance: { name: 'מחזור א', course: { name: 'קורס פיקוד' } },
  motivation: 'מוטיבציה גבוהה',
  commanderNotes: null,
  reviewNotes: null,
};

const renderCandidacy = (user = BIS_USER) =>
  render(
    <ToastProvider>
      <Candidacy user={user as any} />
    </ToastProvider>,
  );

describe('Candidacy page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.getAllCandidacies as ReturnType<typeof vi.fn>).mockResolvedValue([PENDING_CANDIDACY]);
    (api.getMyCandidacySubmissions as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (api.approveCandidacy as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (api.rejectCandidacy as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (api.coordReviewCandidacy as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (api.getUsers as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (api.getCourses as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (api.getTeamMembers as ReturnType<typeof vi.fn>).mockResolvedValue([]);
  });

  it('renders candidacy card after load', async () => {
    renderCandidacy();
    expect(await screen.findByText('יוסי מזרחי')).toBeInTheDocument();
    expect(screen.getByText('קורס פיקוד - מחזור א')).toBeInTheDocument();
  });

  it('BIS_CDR sees approve and reject buttons', async () => {
    renderCandidacy();
    await screen.findByText('יוסי מזרחי');
    expect(screen.getByRole('button', { name: 'אשר' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'דחה' })).toBeInTheDocument();
  });

  it('clicking אשר opens a modal popup (not inline)', async () => {
    renderCandidacy();
    await screen.findByText('יוסי מזרחי');
    await userEvent.click(screen.getByRole('button', { name: 'אשר' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('אישור מועמדות')).toBeInTheDocument();
  });

  it('clicking דחה opens a reject modal', async () => {
    renderCandidacy();
    await screen.findByText('יוסי מזרחי');
    await userEvent.click(screen.getByRole('button', { name: 'דחה' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('דחיית מועמדות')).toBeInTheDocument();
  });

  it('approve submits with optional notes', async () => {
    renderCandidacy();
    await screen.findByText('יוסי מזרחי');
    await userEvent.click(screen.getByRole('button', { name: 'אשר' }));

    const dialog = screen.getByRole('dialog');
    const submitBtn = [...dialog.querySelectorAll('button')].at(-1) as HTMLButtonElement;
    await userEvent.click(submitBtn);

    await waitFor(() =>
      expect(api.approveCandidacy).toHaveBeenCalledWith(100, undefined),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('reject is disabled without notes, enabled after typing', async () => {
    renderCandidacy();
    await screen.findByText('יוסי מזרחי');
    await userEvent.click(screen.getByRole('button', { name: 'דחה' }));

    const dialog = screen.getByRole('dialog');
    const submitBtn = [...dialog.querySelectorAll('button')].at(-1) as HTMLButtonElement;
    expect(submitBtn).toBeDisabled();

    await userEvent.type(screen.getByPlaceholderText('חובה לציין סיבה...'), 'לא מתאים');
    expect(submitBtn).not.toBeDisabled();
  });

  it('reject submits notes to api', async () => {
    renderCandidacy();
    await screen.findByText('יוסי מזרחי');
    await userEvent.click(screen.getByRole('button', { name: 'דחה' }));

    await userEvent.type(screen.getByPlaceholderText('חובה לציין סיבה...'), 'לא עומד בדרישות');

    const dialog = screen.getByRole('dialog');
    const submitBtn = [...dialog.querySelectorAll('button')].at(-1) as HTMLButtonElement;
    await userEvent.click(submitBtn);

    await waitFor(() =>
      expect(api.rejectCandidacy).toHaveBeenCalledWith(100, 'לא עומד בדרישות'),
    );
  });

  it('closing modal via Escape does not submit', async () => {
    renderCandidacy();
    await screen.findByText('יוסי מזרחי');
    await userEvent.click(screen.getByRole('button', { name: 'אשר' }));

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(api.approveCandidacy).not.toHaveBeenCalled();
  });

  it('הגש מועמדות button opens form in a modal for TL', async () => {
    (api.getMyCandidacySubmissions as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    // TL sees submit button
    render(
      <ToastProvider>
        <Candidacy user={TL_USER as any} />
      </ToastProvider>,
    );
    await screen.findByRole('button', { name: /הגש מועמדות/ });
    await userEvent.click(screen.getByRole('button', { name: /הגש מועמדות/ }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('הגשת מועמדות חדשה')).toBeInTheDocument();
  });

  it('empty state shows when no candidacies for trainee', async () => {
    render(
      <ToastProvider>
        <Candidacy user={TRAINEE_USER as any} />
      </ToastProvider>,
    );
    expect(await screen.findByText('אין מועמדויות עדיין')).toBeInTheDocument();
  });
});
