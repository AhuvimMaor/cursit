import { BookOpen, GraduationCap, LayoutDashboard, LogOut, Settings, Target } from 'lucide-react';
import { useState } from 'react';

import type { AuthUser } from '../lib/auth';
import { IS_DEV } from '../lib/auth';
import { HEBREW_ROLES, Role } from '../lib/roles';
import { DevRoleSwitcher } from './DevRoleSwitcher';

type Page = 'dashboard' | 'students' | 'missions';

type SidebarProps = {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  user: AuthUser;
  onRoleChange: (role: Role) => void;
  onLogout: () => void;
};

const NAV_ITEMS: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'לוח בקרה', icon: <LayoutDashboard size={20} /> },
  { page: 'students', label: 'תלמידים', icon: <GraduationCap size={20} /> },
  { page: 'missions', label: 'משימות', icon: <Target size={20} /> },
];

export const Sidebar = ({
  currentPage,
  onNavigate,
  user,
  onRoleChange,
  onLogout,
}: SidebarProps) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <aside className='fixed right-0 top-0 z-40 flex h-screen w-64 flex-col border-l border-border bg-white'>
      <div className='flex h-16 items-center gap-2.5 border-b border-border px-6'>
        <BookOpen size={24} className='text-primary' />
        <span className='text-xl font-bold text-foreground'>Cursit</span>
      </div>

      <nav className='flex-1 px-3 py-4'>
        <ul className='space-y-1'>
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <li key={item.page}>
                <button
                  onClick={() => onNavigate(item.page)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className='border-t border-border p-4'>
        {IS_DEV && showSettings && (
          <div className='mb-3 rounded-lg border border-dashed border-orange-300 bg-orange-50/50 p-3'>
            <p className='mb-2 text-xs font-medium text-orange-700'>🛠 כלי פיתוח</p>
            <DevRoleSwitcher user={user} onRoleChange={onRoleChange} />
          </div>
        )}

        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary'>
            {user.name.charAt(0)}
          </div>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium text-foreground'>{user.name}</p>
            <p className='text-xs text-muted-foreground'>{HEBREW_ROLES[user.role]}</p>
          </div>
          <div className='flex gap-1'>
            {IS_DEV && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`rounded-lg p-1.5 transition-colors ${
                  showSettings
                    ? 'bg-orange-100 text-orange-600'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                title='הגדרות פיתוח'
              >
                <Settings size={16} />
              </button>
            )}
            <button
              onClick={onLogout}
              className='rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500'
              title='התנתקות'
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
