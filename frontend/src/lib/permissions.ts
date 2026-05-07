import { Role } from './roles';

export type Page =
  | 'courses-hub'
  | 'candidacy'
  | 'approvals'
  | 'my-registrations'
  | 'admin';

const ROLE_PAGES: Record<Role, Page[]> = {
  [Role.BIS_CDR]: ['courses-hub', 'candidacy', 'admin'],
  [Role.BRANCH_COORD]: ['courses-hub', 'approvals'],
  [Role.TEAM_LEADER]: ['courses-hub', 'candidacy'],
  [Role.TRAINEE]: ['courses-hub', 'my-registrations'],
  [Role.UNIT_TRAINING]: ['approvals'],
};

export const getAllowedPages = (role: Role): Page[] => ROLE_PAGES[role];

export const canAccess = (role: Role, page: Page): boolean =>
  ROLE_PAGES[role]?.includes(page) ?? false;

export const getDefaultPage = (role: Role): Page => ROLE_PAGES[role]?.[0] ?? 'courses-hub';
