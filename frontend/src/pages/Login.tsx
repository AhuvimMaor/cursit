import { BookOpen, LogIn } from 'lucide-react';
import { useCallback, useState } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import type { AuthUser } from '../lib/auth';
import { HEBREW_ROLES, Role } from '../lib/roles';

type LoginProps = {
  onLogin: (user: AuthUser) => void;
};

const ROLE_COLORS: Record<Role, string> = {
  [Role.BIS_CDR]: 'bg-purple-100 text-purple-700',
  [Role.BRANCH_COORD]: 'bg-blue-100 text-blue-700',
  [Role.TEAM_LEADER]: 'bg-amber-100 text-amber-700',
  [Role.TRAINEE]: 'bg-emerald-100 text-emerald-700',
};

export const Login = ({ onLogin }: LoginProps) => {
  const fetchUsers = useCallback(() => api.getUsers(), []);
  const { data: users, loading } = useApi(fetchUsers);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async (user: AuthUser) => {
    setSelectedId(user.id);
    setLoggingIn(true);
    try {
      const fullUser = await api.login(user.uniqueId);
      setTimeout(() => onLogin(fullUser), 400);
    } catch {
      setLoggingIn(false);
      setSelectedId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  const roleGroups = [Role.BIS_CDR, Role.BRANCH_COORD, Role.TEAM_LEADER, Role.TRAINEE];

  return (
    <div
      dir='rtl'
      className='flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    >
      <div className='w-full max-w-lg'>
        <div className='mb-8 text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25'>
            <BookOpen size={32} className='text-white' />
          </div>
          <h1 className='text-3xl font-bold text-foreground'>ביס 60</h1>
          <p className='mt-2 text-sm text-muted-foreground'>מערכת ניהול הדרכה וקורסים</p>
        </div>

        <div className='rounded-2xl border border-border bg-white p-8 shadow-xl shadow-black/5'>
          <h2 className='mb-1 text-lg font-semibold text-foreground'>התחברות</h2>
          <p className='mb-6 text-sm text-muted-foreground'>בחר משתמש (סביבת פיתוח)</p>

          <div className='space-y-4'>
            {roleGroups.map((role) => {
              const roleUsers = users?.filter((u) => u.role === role) ?? [];
              if (roleUsers.length === 0) return null;

              return (
                <div key={role}>
                  <p className='mb-2 text-xs font-medium text-muted-foreground'>
                    {HEBREW_ROLES[role]}
                  </p>
                  <div className='space-y-1.5'>
                    {roleUsers.slice(0, 3).map((user) => {
                      const isSelected = selectedId === user.id;
                      return (
                        <button
                          key={user.id}
                          onClick={() => handleLogin(user as AuthUser)}
                          disabled={loggingIn}
                          className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-right transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/30 hover:bg-muted/50'
                          } ${loggingIn && !isSelected ? 'opacity-40' : ''}`}
                        >
                          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'>
                            {user.name.charAt(0)}
                          </div>
                          <div className='flex-1'>
                            <p className='text-sm font-medium text-foreground'>{user.name}</p>
                            {user.branch && (
                              <p className='text-xs text-muted-foreground'>{user.branch.name}</p>
                            )}
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[role]}`}
                          >
                            {HEBREW_ROLES[role]}
                          </span>
                          {isSelected && loggingIn && (
                            <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className='mt-6 flex items-center gap-3'>
            <div className='h-px flex-1 bg-border' />
            <span className='text-xs text-muted-foreground'>או</span>
            <div className='h-px flex-1 bg-border' />
          </div>

          <button
            disabled={loggingIn}
            className='mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-foreground/90 disabled:opacity-50'
          >
            <LogIn size={16} />
            התחברות עם OAuth
          </button>
        </div>
      </div>
    </div>
  );
};
