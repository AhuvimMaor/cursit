import { Role } from './roles';

export type Page = 'dashboard' | 'students' | 'missions' | 'my-scores';

const ROLE_PAGES: Record<Role, Page[]> = {
  [Role.ADMIN]: ['dashboard', 'students', 'missions'],
  [Role.TEACHER]: ['dashboard', 'students', 'missions'],
  [Role.STUDENT]: ['dashboard', 'my-scores'],
};

export const getAllowedPages = (role: Role): Page[] => ROLE_PAGES[role];

export const canAccess = (role: Role, page: Page): boolean => ROLE_PAGES[role].includes(page);

export const getDefaultPage = (role: Role): Page => ROLE_PAGES[role][0];
