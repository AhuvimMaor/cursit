import { Role } from './roles';

export type Page =
  | 'dashboard'
  | 'courses-hub'
  | 'candidacy'
  | 'approvals'
  | 'my-registrations'
  | 'info'
  | 'admin';

const ROLE_PAGES: Record<Role, Page[]> = {
  [Role.BIS_CDR]: ['dashboard', 'courses-hub', 'candidacy', 'approvals', 'info', 'admin'],
  [Role.BRANCH_COORD]: ['dashboard', 'courses-hub', 'candidacy', 'approvals'],
  [Role.TEAM_LEADER]: ['dashboard', 'courses-hub', 'candidacy', 'approvals'],
  [Role.TRAINEE]: ['dashboard', 'courses-hub', 'my-registrations', 'info'],
};

export const getAllowedPages = (role: Role): Page[] => ROLE_PAGES[role];

export const canAccess = (role: Role, page: Page): boolean =>
  ROLE_PAGES[role]?.includes(page) ?? false;

export const getDefaultPage = (role: Role): Page => ROLE_PAGES[role]?.[0] ?? 'dashboard';
