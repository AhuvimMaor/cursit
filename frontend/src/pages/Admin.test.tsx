import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ToastProvider } from '../components/ToastProvider';
import { api } from '../lib/api';
import { Admin } from './Admin';

vi.mock('../lib/api', () => ({
  api: {
    getUsers: vi.fn(),
    getBranches: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    getCourses: vi.fn(),
    createCourse: vi.fn(),
    updateCourse: vi.fn(),
    createInstance: vi.fn(),
    createBranch: vi.fn(),
    createTeam: vi.fn(),
    getEvents: vi.fn(),
  },
}));

vi.mock('../components/ScreenGuide', () => ({
  ScreenGuide: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

const MOCK_USER = {
  id: 1,
  name: 'אלי כהן',
  uniqueId: 'u001',
  role: 'TEAM_LEADER',
  isActive: true,
  branchId: 1,
  teamId: 1,
  branch: { name: 'ענף צפון' },
  team: { name: 'צוות א' },
};

const MOCK_BRANCH = {
  id: 1,
  name: 'ענף צפון',
  teams: [{ id: 1, name: 'צוות א' }],
};

const MOCK_COURSE = {
  id: 1,
  name: 'קורס יסוד',
  description: 'תיאור קורס יסוד מלא לבדיקה',
  type: 'FOUNDATION',
  isPublished: true,
  instances: [],
  gmushHours: null,
  location: null,
  requirements: null,
};

const renderAdmin = () =>
  render(
    <ToastProvider>
      <Admin />
    </ToastProvider>,
  );

describe('Admin page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.getUsers as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_USER]);
    (api.getBranches as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_BRANCH]);
    (api.getCourses as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_COURSE]);
    (api.getEvents as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (api.createUser as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (api.updateUser as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (api.createCourse as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (api.updateCourse as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (api.createInstance as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (api.createBranch as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (api.createTeam as ReturnType<typeof vi.fn>).mockResolvedValue({});
  });

  // ── USERS TAB ──────────────────────────────────────

  it('renders users tab by default with user rows', async () => {
    renderAdmin();
    expect(await screen.findByText('אלי כהן')).toBeInTheDocument();
    expect(screen.getByText('u001')).toBeInTheDocument();
  });

  it('"הוסף משתמש" opens a modal (not inline)', async () => {
    renderAdmin();
    await screen.findByText('אלי כהן');
    await userEvent.click(screen.getByRole('button', { name: /הוסף משתמש/ }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('משתמש חדש')).toBeInTheDocument();
  });

  it('create user modal has name and id fields', async () => {
    renderAdmin();
    await screen.findByText('אלי כהן');
    await userEvent.click(screen.getByRole('button', { name: /הוסף משתמש/ }));

    const dialog = screen.getByRole('dialog');
    expect(dialog.querySelector('input[value=""]')).toBeInTheDocument();
  });

  it('create user submit calls api.createUser', async () => {
    renderAdmin();
    await screen.findByText('אלי כהן');
    await userEvent.click(screen.getByRole('button', { name: /הוסף משתמש/ }));

    const dialog = screen.getByRole('dialog');
    const inputs = dialog.querySelectorAll('input');
    await userEvent.type(inputs[0], 'שם חדש');
    await userEvent.type(inputs[1], 'new001');

    const submitBtn = screen.getByRole('button', { name: /צור/ });
    await userEvent.click(submitBtn);

    await waitFor(() =>
      expect(api.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'שם חדש', uniqueId: 'new001' }),
      ),
    );
  });

  it('create user modal closes after successful submit', async () => {
    renderAdmin();
    await screen.findByText('אלי כהן');
    await userEvent.click(screen.getByRole('button', { name: /הוסף משתמש/ }));

    const dialog = screen.getByRole('dialog');
    const inputs = dialog.querySelectorAll('input');
    await userEvent.type(inputs[0], 'שם');
    await userEvent.type(inputs[1], 'id001');

    await userEvent.click(screen.getByRole('button', { name: /צור/ }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('edit user row opens edit modal', async () => {
    renderAdmin();
    await screen.findByText('אלי כהן');
    await userEvent.click(screen.getByRole('button', { name: 'ערוך' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('עריכת משתמש')).toBeInTheDocument();
  });

  it('edit user modal shows existing name', async () => {
    renderAdmin();
    await screen.findByText('אלי כהן');
    await userEvent.click(screen.getByRole('button', { name: 'ערוך' }));

    const dialog = screen.getByRole('dialog');
    const nameInput = dialog.querySelector('input[value="אלי כהן"]') as HTMLInputElement;
    expect(nameInput).not.toBeNull();
    expect(nameInput.value).toBe('אלי כהן');
  });

  it('cancel button closes modal without saving', async () => {
    renderAdmin();
    await screen.findByText('אלי כהן');
    await userEvent.click(screen.getByRole('button', { name: 'ערוך' }));

    await userEvent.click(screen.getByRole('button', { name: 'ביטול' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(api.updateUser).not.toHaveBeenCalled();
  });

  // ── COURSES TAB ────────────────────────────────────

  it('switching to courses tab shows course list', async () => {
    renderAdmin();
    await screen.findByText('אלי כהן');
    await userEvent.click(screen.getByRole('button', { name: 'קורסים ומחזורים' }));
    expect(await screen.findByText('קורס יסוד')).toBeInTheDocument();
  });

  it('"קורס חדש" opens modal', async () => {
    renderAdmin();
    await screen.findByText('אלי כהן');
    await userEvent.click(screen.getByRole('button', { name: 'קורסים ומחזורים' }));
    await screen.findByText('קורס יסוד');

    await userEvent.click(screen.getByRole('button', { name: /קורס חדש/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('קורס חדש')).toBeInTheDocument();
  });

  it('course edit button opens edit modal', async () => {
    renderAdmin();
    await screen.findByText('אלי כהן');
    await userEvent.click(screen.getByRole('button', { name: 'קורסים ומחזורים' }));
    await screen.findByText('קורס יסוד');

    await userEvent.click(screen.getByRole('button', { name: 'ערוך' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('עריכת קורס')).toBeInTheDocument();
  });

  it('"מחזור חדש" link opens instance modal when course expanded', async () => {
    renderAdmin();
    await screen.findByText('אלי כהן');
    await userEvent.click(screen.getByRole('button', { name: 'קורסים ומחזורים' }));
    await screen.findByText('קורס יסוד');

    // expand the course row
    await userEvent.click(screen.getByText('קורס יסוד'));
    // click "מחזור חדש"
    await userEvent.click(screen.getByRole('button', { name: /מחזור חדש/ }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('מחזור חדש')).toBeInTheDocument();
  });

  // ── BRANCHES TAB ───────────────────────────────────

  it('branches tab shows branch cards', async () => {
    renderAdmin();
    await screen.findByText('אלי כהן');
    await userEvent.click(screen.getByRole('button', { name: 'ענפים וצוותות' }));
    expect(await screen.findByText('ענף צפון')).toBeInTheDocument();
    expect(screen.getByText('צוות א')).toBeInTheDocument();
  });

  it('"הוסף ענף" opens modal', async () => {
    renderAdmin();
    await screen.findByText('אלי כהן');
    await userEvent.click(screen.getByRole('button', { name: 'ענפים וצוותות' }));
    await screen.findByText('ענף צפון');

    await userEvent.click(screen.getByRole('button', { name: /הוסף ענף/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('ענף חדש')).toBeInTheDocument();
  });

  it('"הוסף צוות" opens modal for that branch', async () => {
    renderAdmin();
    await screen.findByText('אלי כהן');
    await userEvent.click(screen.getByRole('button', { name: 'ענפים וצוותות' }));
    await screen.findByText('ענף צפון');

    await userEvent.click(screen.getByRole('button', { name: /הוסף צוות/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/הוסף צוות לענף צפון/)).toBeInTheDocument();
  });

  it('no inline forms appear anywhere in the DOM outside dialogs', async () => {
    renderAdmin();
    await screen.findByText('אלי כהן');

    // No forms should be open yet - all modals closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Open a modal
    await userEvent.click(screen.getByRole('button', { name: /הוסף משתמש/ }));
    // Only ONE dialog
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });
});
