import {
  BookOpen,
  Calendar,
  CheckSquare,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Users,
} from 'lucide-react';

import type { AuthUser } from '../lib/auth';
import type { Page } from '../lib/permissions';
import { canAccess } from '../lib/permissions';
import { HEBREW_ROLES } from '../lib/roles';

type SidebarProps = {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  user: AuthUser;
  onLogout: () => void;
};

const NAV_ITEMS: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'לוח בקרה', icon: <LayoutDashboard size={20} /> },
  { page: 'gantt', label: 'גאנט קורסים', icon: <Calendar size={20} /> },
  { page: 'courses', label: 'קטלוג קורסים', icon: <GraduationCap size={20} /> },
  { page: 'candidacy', label: 'מועמדויות', icon: <Users size={20} /> },
  { page: 'approvals', label: 'אישור רישומים', icon: <CheckSquare size={20} /> },
  { page: 'my-registrations', label: 'הרישומים שלי', icon: <ClipboardList size={20} /> },
  { page: 'info', label: 'מידע', icon: <FileText size={20} /> },
];

export const Sidebar = ({ currentPage, onNavigate, user, onLogout }: SidebarProps) => {
  const visibleItems = NAV_ITEMS.filter((item) => canAccess(user.role, item.page));

  return (
    <aside className='fixed right-0 top-0 z-40 flex h-screen w-64 flex-col border-l border-border bg-white'>
      <div className='flex h-16 items-center gap-2.5 border-b border-border px-6'>
        <BookOpen size={24} className='text-primary' />
        <span className='text-xl font-bold text-foreground'>Coursit</span>
      </div>

      <nav className='flex-1 px-3 py-4'>
        <ul className='space-y-1'>
          {visibleItems.map((item) => {
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

      <div className='border-t border-border p-4'>
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary'>
            {user.name.charAt(0)}
          </div>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium text-foreground'>{user.name}</p>
            <p className='text-xs text-muted-foreground'>{HEBREW_ROLES[user.role]}</p>
          </div>
          <button
            onClick={onLogout}
            className='rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500'
            title='התנתקות'
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
