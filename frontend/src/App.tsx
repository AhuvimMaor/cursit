import { useEffect, useState } from 'react';

import { Sidebar } from './components/Sidebar';
import type { AuthUser } from './lib/auth';
import { clearUser, loadUser, saveUser } from './lib/auth';
import type { Page } from './lib/permissions';
import { canAccess, getDefaultPage } from './lib/permissions';
import { Admin } from './pages/Admin';
import { Approvals } from './pages/Approvals';
import { Candidacy } from './pages/Candidacy';
import { CoursesHub } from './pages/CoursesHub';
import { Dashboard } from './pages/Dashboard';
import { Info } from './pages/Info';
import { Login } from './pages/Login';
import { MyRegistrations } from './pages/MyRegistrations';

export const App = () => {
  const [user, setUser] = useState<AuthUser | null>(loadUser);
  const [page, setPage] = useState<Page>('dashboard');
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
    setPage('dashboard');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard user={user} onNavigate={goToPage} />;
      case 'courses-hub':
        return <CoursesHub user={user} />;
      case 'candidacy':
        return <Candidacy user={user} />;
      case 'approvals':
        return <Approvals user={user} />;
      case 'my-registrations':
        return <MyRegistrations />;
      case 'info':
        return <Info />;
      case 'admin':
        return <Admin />;
    }
  };

  return (
    <div dir='rtl' className='min-h-screen bg-slate-100/80'>
      <Sidebar
        currentPage={page}
        onNavigate={(p) => goToPage(p)}
        user={user}
        onLogout={handleLogout}
      />
      <main className='mr-72 min-h-screen p-4 sm:p-6 lg:p-8'>
        <div className='mx-auto max-w-[1400px] rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 lg:p-8'>
          {renderPage()}
        </div>
      </main>
    </div>
  );
};
