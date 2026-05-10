import { useCallback, useEffect, useMemo, useState } from 'react';

import { Sidebar } from './components/Sidebar';
import { ToastProvider } from './components/ToastProvider';
import { useApi } from './hooks/useApi';
import { api } from './lib/api';
import type { AuthUser } from './lib/auth';
import { clearUser, loadUser, saveUser } from './lib/auth';
import type { Page } from './lib/permissions';
import { canAccess, getDefaultPage } from './lib/permissions';
import { Role } from './lib/roles';
import { Admin } from './pages/Admin';
import { Approvals } from './pages/Approvals';
import { Candidacy } from './pages/Candidacy';
import { CoursesHub } from './pages/CoursesHub';
import { Login } from './pages/Login';
import { MyRegistrations } from './pages/MyRegistrations';

export const App = () => {
  const [user, setUser] = useState<AuthUser | null>(loadUser);
  const [page, setPage] = useState<Page>('courses-hub');
  const goToPage = (next: Page) => {
    setPage(next);
  };

  useEffect(() => {
    if (user && !canAccess(user.role, page)) {
      setPage(getDefaultPage(user.role));
    }
  }, [user, page]);

  const handleLogin = (u: AuthUser) => {
    saveUser(u);
    setUser(u);
    setPage(getDefaultPage(u.role));
  };

  const handleLogout = () => {
    clearUser();
    setUser(null);
    setPage('courses-hub');
  };

  if (!user) {
    return (
      <ToastProvider>
        <Login onLogin={handleLogin} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <AppShell user={user} page={page} goToPage={goToPage} onLogout={handleLogout} />
    </ToastProvider>
  );
};

function AppShell({ user, page, goToPage, onLogout }: { user: AuthUser; page: Page; goToPage: (p: Page) => void; onLogout: () => void }) {
  const badgeFetcher = useCallback(() => {
    if (user.role === Role.BRANCH_COORD) {
      return api.getBranchRegistrations().then((regs) => ({
        approvals: regs.filter((r) => r.status === 'PENDING_COORD').length,
        candidacy: 0,
      }));
    }
    if (user.role === Role.BIS_CDR) {
      return api.getAllCandidacies().then((cands) => ({
        approvals: 0,
        candidacy: cands.filter((c) => c.status === 'PENDING' || c.status === 'COORD_REVIEWED').length,
      }));
    }
    return Promise.resolve({ approvals: 0, candidacy: 0 });
  }, [user.role]);

  const { data: counts } = useApi(badgeFetcher);

  const badges = useMemo(() => {
    if (!counts) return undefined;
    const b: Partial<Record<Page, number>> = {};
    if (counts.approvals > 0) b.approvals = counts.approvals;
    if (counts.candidacy > 0) b.candidacy = counts.candidacy;
    return Object.keys(b).length > 0 ? b : undefined;
  }, [counts]);

  const renderPage = () => {
    switch (page) {
      case 'courses-hub':
        return <CoursesHub user={user} />;
      case 'candidacy':
        return <Candidacy user={user} />;
      case 'approvals':
        return <Approvals />;
      case 'my-registrations':
        return <MyRegistrations />;
      case 'admin':
        return <Admin />;
    }
  };

  return (
    <div className='min-h-screen bg-slate-100'>
      <Sidebar
        currentPage={page}
        onNavigate={(p) => goToPage(p)}
        user={user}
        onLogout={onLogout}
        badges={badges}
      />
      <main className='mr-72 min-h-screen p-4 sm:p-6 lg:p-8'>
        <div className='mx-auto max-w-[1400px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8'>
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
