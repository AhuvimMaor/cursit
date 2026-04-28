import { BookOpen, LogIn } from 'lucide-react';
import { useState } from 'react';

import type { AuthUser } from '../lib/auth';
import { Role } from '../lib/roles';

const MOCK_USERS: AuthUser[] = [
  { id: 100, name: 'אדמין ראשי', email: 'admin@cursit.dev', role: Role.ADMIN },
  { id: 101, name: 'שרה כהן', email: 'sarah@cursit.dev', role: Role.TEACHER },
  { id: 2, name: 'נועה כהן', email: 'noa@cursit.dev', role: Role.STUDENT },
];

type LoginProps = {
  onLogin: (user: AuthUser) => void;
};

export const Login = ({ onLogin }: LoginProps) => {
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (user: AuthUser) => {
    setSelectedUser(user);
    setLoading(true);
    setTimeout(() => {
      onLogin(user);
    }, 800);
  };

  return (
    <div
      dir='rtl'
      className='flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    >
      <div className='w-full max-w-md'>
        <div className='mb-8 text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25'>
            <BookOpen size={32} className='text-white' />
          </div>
          <h1 className='text-3xl font-bold text-foreground'>Cursit</h1>
          <p className='mt-2 text-sm text-muted-foreground'>מערכת ניהול קורסים ומעקב ציונים</p>
        </div>

        <div className='rounded-2xl border border-border bg-white p-8 shadow-xl shadow-black/5'>
          <h2 className='mb-1 text-lg font-semibold text-foreground'>התחברות</h2>
          <p className='mb-6 text-sm text-muted-foreground'>בחר משתמש להתחברות (סביבת פיתוח)</p>

          <div className='space-y-3'>
            {MOCK_USERS.map((user) => {
              const isSelected = selectedUser?.id === user.id;
              const roleColor =
                user.role === Role.ADMIN
                  ? 'bg-purple-100 text-purple-700'
                  : user.role === Role.TEACHER
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-emerald-100 text-emerald-700';
              const roleLabel =
                user.role === Role.ADMIN ? 'מנהל' : user.role === Role.TEACHER ? 'מורה' : 'תלמיד';

              return (
                <button
                  key={user.id}
                  onClick={() => handleLogin(user)}
                  disabled={loading}
                  className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-right transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30 hover:bg-muted/50'
                  } ${loading && !isSelected ? 'opacity-50' : ''}`}
                >
                  <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary'>
                    {user.name.charAt(0)}
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-foreground'>{user.name}</p>
                    <p className='text-xs text-muted-foreground'>{user.email}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleColor}`}>
                    {roleLabel}
                  </span>
                  {isSelected && loading && (
                    <div className='h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                  )}
                </button>
              );
            })}
          </div>

          <div className='mt-6 flex items-center gap-3'>
            <div className='h-px flex-1 bg-border' />
            <span className='text-xs text-muted-foreground'>או</span>
            <div className='h-px flex-1 bg-border' />
          </div>

          <button
            disabled={loading}
            className='mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-foreground/90 disabled:opacity-50'
          >
            <LogIn size={16} />
            התחברות עם OAuth
          </button>

          <p className='mt-4 text-center text-xs text-muted-foreground'>
            🔒 סביבת פיתוח — ללא אימות אמיתי
          </p>
        </div>
      </div>
    </div>
  );
};
