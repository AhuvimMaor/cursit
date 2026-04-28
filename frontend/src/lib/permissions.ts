import { Role } from './roles';

export type Page =
  | 'dashboard'
  | 'gantt'
  | 'courses'
  | 'candidacy'
  | 'approvals'
  | 'my-registrations'
  | 'info';

const ROLE_PAGES: Record<Role, Page[]> = {
  [Role.BIS_CDR]: ['dashboard', 'gantt', 'courses', 'candidacy', 'approvals', 'info'],
  [Role.BRANCH_COORD]: ['dashboard', 'gantt', 'courses', 'candidacy', 'approvals'],
  [Role.TEAM_LEADER]: ['dashboard', 'gantt', 'courses', 'candidacy'],
  [Role.TRAINEE]: ['dashboard', 'gantt', 'courses', 'my-registrations', 'info'],
};

export const getAllowedPages = (role: Role): Page[] => ROLE_PAGES[role];

export const canAccess = (role: Role, page: Page): boolean =>
  ROLE_PAGES[role]?.includes(page) ?? false;

export const getDefaultPage = (role: Role): Page => ROLE_PAGES[role]?.[0] ?? 'dashboard';
