import type { Role } from './roles';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
};

const AUTH_KEY = 'cursit_user';

export const saveUser = (user: AuthUser) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
};

export const loadUser = (): AuthUser | null => {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const clearUser = () => {
  localStorage.removeItem(AUTH_KEY);
};

export const IS_DEV = import.meta.env.DEV || import.meta.env.VITE_DEV_BUILD === 'true';
