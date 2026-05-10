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
    <aside className='fixed right-0 top-0 z-40 flex h-screen w-72 flex-col border-l border-slate-200 bg-[#0f1923] text-white shadow-2xl'>
      {/* Brand */}
      <div className='flex flex-col gap-0 border-b border-white/10 px-5 py-5'>
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500 shadow-lg shadow-sky-500/30'>
            <BRAND_ICON size={19} strokeWidth={2.5} className='text-white' />
          </div>
          <div className='min-w-0'>
            <p className='truncate text-base font-bold tracking-tight text-white'>
              {APP_BRAND.name}
            </p>
            <p className='truncate text-[11px] text-slate-400'>{APP_BRAND.tagline}</p>
          </div>
        </div>
      </div>

      {/* Search — disabled until wired */}
      <div className='border-b border-white/10 px-3 py-2.5'>
        <div className='relative'>
          <Search
            size={13}
            className='pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500'
          />
          <input
            type='search'
            disabled
            title='חיפוש יתווסף בהמשך'
            placeholder='חיפוש - בקרוב'
            className='w-full cursor-not-allowed rounded-lg border border-transparent bg-white/5 py-1.5 pr-8 pl-3 text-xs text-slate-500 outline-none placeholder:text-slate-600'
          />
        </div>
      </div>

      <nav className='flex-1 overflow-y-auto px-2.5 py-3'>
        {NAV_GROUPS.map((group) => {
          const visiblePages = group.pages.filter((p) => canAccess(user.role, p));
          if (visiblePages.length === 0) return null;

          return (
            <div key={group.id} className='mb-4 last:mb-0'>
              {/* Group label */}
              <div className='mb-1 flex items-center gap-2 px-2'>
                <span className='text-[10px] font-semibold uppercase tracking-widest text-slate-500'>
                  {group.title}
                </span>
                <span className='h-px flex-1 bg-white/8' />
              </div>

              <ul className='space-y-0.5'>
                {visiblePages.map((page) => {
                  const meta = PAGE_NAV_META[page];
                  const NAV_PAGE_ICON = meta.icon;
                  const isActive = currentPage === page;

                  return (
                    <li key={page} className='relative'>
                      {/* Active indicator bar pinned to the sidebar right edge */}
                      <span
                        className={`absolute right-0 top-1/2 h-7 w-0.5 -translate-y-1/2 rounded-l-full bg-sky-400 transition-opacity duration-150 ${
                          isActive ? 'opacity-100' : 'opacity-0'
                        }`}
                        aria-hidden='true'
                      />
                      <button
                        type='button'
                        onClick={() => onNavigate(page)}
                        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-right transition-all duration-150 ${
                          isActive
                            ? 'bg-sky-500/20 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.25)]'
                            : 'hover:bg-white/6'
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                            isActive
                              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                              : 'bg-white/8 text-slate-400 group-hover:bg-white/12 group-hover:text-slate-200'
                          }`}
                        >
                          <NAV_PAGE_ICON size={16} strokeWidth={isActive ? 2.5 : 2} />
                        </span>

                        <span className='min-w-0 flex-1'>
                          <span
                            className={`block truncate text-[13px] font-medium leading-tight ${
                              isActive ? 'text-sky-300' : 'text-slate-300 group-hover:text-white'
                            }`}
                          >
                            {meta.label}
                          </span>
                          <span className='mt-0.5 block truncate text-[11px] leading-tight text-slate-600 group-hover:text-slate-500'>
                            {meta.description}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className='border-t border-white/10 bg-black/20 p-3'>
        <div className='flex items-center gap-2.5 rounded-lg border border-white/8 bg-white/5 p-2.5'>
          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600/40 text-xs font-bold text-sky-300 ring-1 ring-sky-500/30'>
            {user.name.charAt(0)}
          </div>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-[13px] font-medium text-slate-200'>{user.name}</p>
            <p className='truncate text-[11px] text-slate-500'>{HEBREW_ROLES[user.role]}</p>
          </div>
          <button
            type='button'
            onClick={onLogout}
            className='rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-500/15 hover:text-red-400'
            title='התנתקות'
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};
