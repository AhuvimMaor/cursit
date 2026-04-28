import type { Role } from './roles';

export type AuthUser = {
  id: number;
  uniqueId: string;
  name: string;
  role: Role;
  teamId?: number | null;
  branchId?: number | null;
  team?: { id: number; name: string } | null;
  branch?: { id: number; name: string } | null;
};

const AUTH_KEY = 'cursit_user';

export const saveUser = (user: AuthUser) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
};

export const loadUser = (): AuthUser | null => {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as AuthUser;
    if (!user.role || !user.id || !user.uniqueId) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
    return user;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
};

export const clearUser = () => {
  localStorage.removeItem(AUTH_KEY);
};

export const IS_DEV = import.meta.env.DEV || import.meta.env.VITE_DEV_BUILD === 'true';
