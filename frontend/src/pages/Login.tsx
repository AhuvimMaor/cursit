import { LogIn, Shield } from 'lucide-react';
import { useCallback, useState } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import type { AuthUser } from '../lib/auth';
import { IS_DEV } from '../lib/auth';
import { HEBREW_ROLES, Role } from '../lib/roles';

type LoginProps = {
  onLogin: (user: AuthUser) => void;
};

const ROLE_BADGE: Record<Role, { bg: string; text: string }> = {
  [Role.BIS_CDR]: { bg: 'bg-sky-900/60', text: 'text-sky-300' },
  [Role.BRANCH_COORD]: { bg: 'bg-indigo-900/60', text: 'text-indigo-300' },
  [Role.TEAM_LEADER]: { bg: 'bg-amber-900/60', text: 'text-amber-300' },
  [Role.TRAINEE]: { bg: 'bg-slate-700/60', text: 'text-slate-300' },
  [Role.UNIT_TRAINING]: { bg: 'bg-emerald-900/60', text: 'text-emerald-300' },
};

/** חייב להתאים ל-seed ב-api.ts */
const FALLBACK_USERS: AuthUser[] = [
  { id: 1, uniqueId: '1000000', name: 'דוד כהן', role: Role.BIS_CDR },
  {
    id: 2,
    uniqueId: '2000001',
    name: 'שרה לוי',
    role: Role.BRANCH_COORD,
    branchId: 2,
    branch: { id: 2, name: 'ענף טכנולוגיה' },
  },
  {
    id: 3,
    uniqueId: '3000001',
    name: 'נועה מזרחי',
    role: Role.TEAM_LEADER,
    branchId: 2,
    teamId: 1,
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    team: { id: 1, name: 'צוות אלפא' },
  },
  {
    id: 4,
    uniqueId: '4000001',
    name: 'יונתן לוי',
    role: Role.TRAINEE,
    branchId: 2,
    teamId: 1,
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    team: { id: 1, name: 'צוות אלפא' },
  },
];

export const Login = ({ onLogin }: LoginProps) => {
  const fetchUsers = useCallback(() => api.getUsers(), []);
  const fetchKartoffel = useCallback(() => api.getKartoffelMembers().catch(() => []), []);
  const { data: users, loading } = useApi(fetchUsers);
  const { data: kartoffelMembers } = useApi(fetchKartoffel);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [kartoffelSearch, setKartoffelSearch] = useState('');

  const handleLogin = async (user: AuthUser) => {
    setSelectedId(user.id);
    setLoggingIn(true);
    try {
      const fullUser = await api.login(user.uniqueId);
      setTimeout(() => onLogin(fullUser), 400);
    } catch {
      setTimeout(() => onLogin(user), 200);
    }
  };

  const handleKartoffelLogin = async (personalNumber: string, _name: string) => {
    setLoggingIn(true);
    try {
      const fullUser = await api.login(personalNumber);
      setTimeout(() => onLogin(fullUser), 400);
    } catch {
      setLoggingIn(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const roleGroups = [Role.BIS_CDR, Role.BRANCH_COORD, Role.TEAM_LEADER, Role.TRAINEE];
  const usersToShow = users && users.length > 0 ? users : FALLBACK_USERS;

  const filteredKartoffel = kartoffelSearch.length >= 2
    ? (kartoffelMembers ?? [])
        .filter((m) => (m.fullName || m.displayName || '').includes(kartoffelSearch))
        .slice(0, 10)
    : [];

  return (
    <div
      dir='rtl'
      className='relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b1320]'
    >
      {/* Subtle background texture */}
      <div
        className='pointer-events-none absolute inset-0 opacity-30'
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(14,165,233,0.18) 0%, transparent 70%)',
        }}
      />
      {/* Grid overlay */}
      <div
        className='pointer-events-none absolute inset-0 opacity-[0.04]'
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className='relative w-full max-w-md px-4'>
        {/* Brand header */}
        <div className='mb-8 text-center'>
          <div className='mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-500/10 shadow-xl shadow-sky-500/10'>
            <Shield size={30} className='text-sky-400' strokeWidth={1.5} />
          </div>
          <h1 className='text-3xl font-bold tracking-tight text-white'>Bisli</h1>
          <p className='mt-2 text-sm text-slate-400'>מערכת ניהול הדרכה וקורסים</p>
          <div className='mx-auto mt-3 flex items-center justify-center gap-2'>
            <span className='h-px w-8 bg-white/10' />
            <span className='text-[11px] font-medium uppercase tracking-widest text-slate-600'>
              כניסה למערכת
            </span>
            <span className='h-px w-8 bg-white/10' />
          </div>
        </div>

        {/* Login card */}
        <div className='rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm'>
          {!IS_DEV && (
            <div className='space-y-4'>
              <p className='text-center text-sm text-slate-300'>כניסה למערכת באמצעות חשבון ארגוני</p>
              <button
                onClick={() => { window.location.href = '/api/auth'; }}
                className='flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-900/40 transition-colors hover:bg-sky-500'
              >
                <LogIn size={16} />
                כניסה למערכת
              </button>
            </div>
          )}

          {IS_DEV && (
          <>
          {/* Dev environment notice */}
          <div className='mb-4 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/8 px-3 py-2'>
            <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400' />
            <p className='text-[11px] text-amber-400'>סביבת פיתוח - בחר משתמש לכניסה</p>
          </div>

          <div className='max-h-[52vh] space-y-4 overflow-y-auto pl-0.5 pr-0.5'>
            {roleGroups.map((role) => {
              const roleUsers = usersToShow.filter((u) => u.role === role) ?? [];
              if (roleUsers.length === 0) return null;
              const badge = ROLE_BADGE[role];

              return (
                <div key={role}>
                  {/* Role group header */}
                  <div className='mb-2 flex items-center gap-2'>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badge.bg} ${badge.text}`}
                    >
                      {HEBREW_ROLES[role]}
                    </span>
                    <span className='h-px flex-1 bg-white/8' />
                  </div>

                  <div className='space-y-1.5'>
                    {roleUsers.map((user) => {
                      const isSelected = selectedId === user.id;
                      return (
                        <button
                          type='button'
                          key={user.id}
                          onClick={() => handleLogin(user as AuthUser)}
                          disabled={loggingIn}
                          className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-right transition-all duration-150 ${
                            isSelected
                              ? 'border-sky-500/40 bg-sky-500/12 shadow-[0_0_0_1px_rgba(14,165,233,0.2)]'
                              : 'border-white/8 bg-white/4 hover:border-white/15 hover:bg-white/8'
                          } ${loggingIn && !isSelected ? 'opacity-35' : ''}`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                              isSelected
                                ? 'bg-sky-500/30 text-sky-300'
                                : 'bg-white/8 text-slate-400'
                            }`}
                          >
                            {user.name.charAt(0)}
                          </div>
                          <div className='flex-1 text-right'>
                            <p className='text-sm font-semibold text-white'>{user.name}</p>
                            {user.branch && (
                              <p className='text-xs text-slate-500'>{user.branch.name}</p>
                            )}
                          </div>
                          {isSelected && loggingIn && (
                            <div className='h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent' />
                          )}
                          {isSelected && !loggingIn && (
                            <span className='h-2 w-2 shrink-0 rounded-full bg-sky-400' />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Kartoffel search */}
          {kartoffelMembers && kartoffelMembers.length > 0 && (
            <>
              <div className='mt-6 flex items-center gap-3'>
                <div className='h-px flex-1 bg-white/8' />
                <span className='text-xs text-slate-600'>חיפוש מ-Kartoffel</span>
                <div className='h-px flex-1 bg-white/8' />
              </div>

              <div className='mt-3'>
                <input
                  type='search'
                  value={kartoffelSearch}
                  onChange={(e) => setKartoffelSearch(e.target.value)}
                  placeholder='חפש לפי שם...'
                  className='w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-500/40'
                />
                {filteredKartoffel.length > 0 && (
                  <div className='mt-2 max-h-40 space-y-1 overflow-y-auto'>
                    {filteredKartoffel.map((m) => (
                      <button
                        key={m.personalNumber}
                        type='button'
                        onClick={() => handleKartoffelLogin(m.personalNumber, m.fullName || m.displayName || '')}
                        disabled={loggingIn}
                        className='flex w-full items-center gap-3 rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-right transition-all hover:border-white/15 hover:bg-white/8'
                      >
                        <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-300'>
                          {(m.fullName || m.displayName || '?').charAt(0)}
                        </div>
                        <div className='min-w-0 flex-1'>
                          <p className='truncate text-xs font-medium text-white'>{m.fullName || m.displayName}</p>
                          <p className='truncate text-[10px] text-slate-500'>{m.personalNumber}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          </>
          )}
        </div>

        <p className='mt-6 text-center text-[11px] text-slate-700'>
          Bisli - מערכת מאובטחת למשתמשים מורשים בלבד
        </p>
      </div>
    </div>
  );
};
