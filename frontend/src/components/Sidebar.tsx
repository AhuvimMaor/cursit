import { LogOut, Search } from 'lucide-react';

import type { AuthUser } from '../lib/auth';
import { APP_BRAND, NAV_GROUPS, PAGE_NAV_META } from '../lib/navConfig';
import type { Page } from '../lib/permissions';
import { canAccess } from '../lib/permissions';
import { HEBREW_ROLES } from '../lib/roles';

type SidebarProps = {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  user: AuthUser;
  onLogout: () => void;
};

export const Sidebar = ({ currentPage, onNavigate, user, onLogout }: SidebarProps) => {
  const BRAND_ICON = APP_BRAND.icon;

  return (
    <aside className='fixed right-0 top-0 z-40 flex h-screen w-72 flex-col border-l border-slate-200/80 bg-gradient-to-b from-slate-50 to-white shadow-[inset_1px_0_0_rgba(255,255,255,0.6)]'>
      {/* Brand */}
      <div className='flex flex-col gap-0.5 border-b border-slate-200/80 px-4 py-4'>
        <div className='flex items-center gap-2.5'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/25'>
            <BRAND_ICON size={22} strokeWidth={2} />
          </div>
          <div className='min-w-0'>
            <p className='truncate text-lg font-bold tracking-tight text-slate-900'>
              {APP_BRAND.name}
            </p>
            <p className='truncate text-xs text-slate-500'>{APP_BRAND.tagline}</p>
          </div>
        </div>
      </div>

      {/* חיפוש — מושבת עד שיהיה מחובר לנתונים */}
      <div className='border-b border-slate-200/80 px-3 py-2'>
        <div className='relative'>
          <Search
            size={14}
            className='pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400'
          />
          <input
            type='search'
            disabled
            title='חיפוש יתווסף בהמשך'
            placeholder='חיפוש — בקרוב'
            className='w-full cursor-not-allowed rounded-xl border border-transparent bg-slate-100/80 py-2 pr-8 pl-3 text-xs text-slate-500 outline-none placeholder:text-slate-400'
          />
        </div>
      </div>

      <nav className='flex-1 overflow-y-auto px-2 py-2'>
        <ul className='space-y-1'>
          {NAV_GROUPS.flatMap((group) => group.pages)
            .filter((p) => canAccess(user.role, p))
            .map((page) => {
              const meta = PAGE_NAV_META[page];
              const NAV_PAGE_ICON = meta.icon;
              const isActive = currentPage === page;
              return (
                <li key={page}>
                  <button
                    type='button'
                    onClick={() => onNavigate(page)}
                    className={`group flex w-full flex-col gap-0.5 rounded-xl border px-2.5 py-2 text-right transition-all ${
                      isActive
                        ? 'border-primary/25 bg-white shadow-sm shadow-slate-200/60 ring-1 ring-primary/15'
                        : 'border-transparent hover:border-slate-200/80 hover:bg-white/70'
                    }`}
                  >
                    <span className='flex items-center gap-2.5'>
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isActive
                            ? 'bg-primary/15 text-primary'
                            : 'bg-slate-100/90 text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-700'
                        }`}
                      >
                        <NAV_PAGE_ICON size={17} strokeWidth={2} />
                      </span>
                      <span
                        className={`min-w-0 flex-1 truncate text-sm font-semibold ${
                          isActive ? 'text-primary' : 'text-slate-800'
                        }`}
                      >
                        {meta.label}
                      </span>
                      {isActive ? (
                        <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_0_3px_rgba(59,130,246,0.25)]' />
                      ) : null}
                    </span>
                    <span className='pr-[2.75rem] text-[11px] leading-snug text-slate-500'>
                      {meta.description}
                    </span>
                  </button>
                </li>
              );
            })}
        </ul>
      </nav>

      <div className='border-t border-slate-200/80 bg-white/60 p-3 backdrop-blur-sm'>
        <div className='flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 p-2'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary'>
            {user.name.charAt(0)}
          </div>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium text-slate-900'>{user.name}</p>
            <p className='truncate text-xs text-slate-500'>{HEBREW_ROLES[user.role]}</p>
          </div>
          <button
            type='button'
            onClick={onLogout}
            className='rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600'
            title='התנתקות'
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};
