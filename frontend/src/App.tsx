import { useEffect, useState } from 'react';

import { Sidebar } from './components/Sidebar';
import type { AuthUser } from './lib/auth';
import { clearUser, loadUser, saveUser } from './lib/auth';
import type { Page } from './lib/permissions';
import { canAccess, getDefaultPage } from './lib/permissions';
import { Approvals } from './pages/Approvals';
import { Candidacy } from './pages/Candidacy';
import { Courses } from './pages/Courses';
import { Dashboard } from './pages/Dashboard';
import { Gantt } from './pages/Gantt';
import { Info } from './pages/Info';
import { Login } from './pages/Login';
import { MyRegistrations } from './pages/MyRegistrations';

export const App = () => {
  const [user, setUser] = useState<AuthUser | null>(loadUser);
  const [page, setPage] = useState<Page>('dashboard');

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
        return <Dashboard user={user} />;
      case 'gantt':
        return <Gantt />;
      case 'courses':
        return <Courses user={user} />;
      case 'candidacy':
        return <Candidacy user={user} />;
      case 'approvals':
        return <Approvals user={user} />;
      case 'my-registrations':
        return <MyRegistrations />;
      case 'info':
        return <Info />;
    }
  };

  return (
    <div dir='rtl' className='min-h-screen bg-gray-50'>
      <Sidebar currentPage={page} onNavigate={setPage} user={user} onLogout={handleLogout} />
      <main className='mr-64 min-h-screen p-8'>{renderPage()}</main>
    </div>
  );
};
