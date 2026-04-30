import { Role } from './roles';

export type Page =
  | 'dashboard'
  | 'gantt'
  | 'courses'
  | 'candidacy'
  | 'approvals'
  | 'my-registrations'
  | 'info'
  | 'schedule'
  | 'admin';

const ROLE_PAGES: Record<Role, Page[]> = {
  [Role.BIS_CDR]: [
    'dashboard',
    'schedule',
    'gantt',
    'courses',
    'candidacy',
    'approvals',
    'info',
    'admin',
  ],
  [Role.BRANCH_COORD]: ['dashboard', 'schedule', 'gantt', 'courses', 'candidacy', 'approvals'],
  [Role.TEAM_LEADER]: ['dashboard', 'schedule', 'gantt', 'courses', 'candidacy', 'approvals'],
  [Role.TRAINEE]: ['dashboard', 'schedule', 'courses', 'my-registrations', 'info'],
};

export const getAllowedPages = (role: Role): Page[] => ROLE_PAGES[role];

export const canAccess = (role: Role, page: Page): boolean =>
  ROLE_PAGES[role]?.includes(page) ?? false;

export const getDefaultPage = (role: Role): Page => ROLE_PAGES[role]?.[0] ?? 'dashboard';
