import { useEffect, useState } from 'react';

import { Sidebar } from './components/Sidebar';
import type { AuthUser } from './lib/auth';
import { clearUser, loadUser, saveUser } from './lib/auth';
import type { Page } from './lib/permissions';
import { canAccess, getDefaultPage } from './lib/permissions';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Missions } from './pages/Missions';
import { MyScores } from './pages/MyScores';
import { StudentDetail } from './pages/StudentDetail';
import { Students } from './pages/Students';

export const App = () => {
  const [user, setUser] = useState<AuthUser | null>(loadUser);
  const [page, setPage] = useState<Page>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  useEffect(() => {
    if (user && !canAccess(user.role, page)) {
      setPage(getDefaultPage(user.role));
      setSelectedStudentId(null);
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
    setSelectedStudentId(null);
  };

  const handleStudentClick = (id: number) => {
    setSelectedStudentId(id);
    setPage('students');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    if (page === 'students' && selectedStudentId) {
      return (
        <StudentDetail studentId={selectedStudentId} onBack={() => setSelectedStudentId(null)} />
      );
    }
    switch (page) {
      case 'dashboard':
        return <Dashboard user={user} onStudentClick={handleStudentClick} />;
      case 'students':
        return <Students onStudentClick={handleStudentClick} />;
      case 'missions':
        return <Missions user={user} />;
      case 'my-scores':
        return <MyScores user={user} />;
    }
  };

  return (
    <div dir='rtl' className='min-h-screen bg-gray-50'>
      <Sidebar
        currentPage={page}
        onNavigate={(p) => {
          setPage(p);
          setSelectedStudentId(null);
        }}
        user={user}
        onLogout={handleLogout}
      />
      <main className='mr-64 min-h-screen p-8'>{renderPage()}</main>
    </div>
  );
};
