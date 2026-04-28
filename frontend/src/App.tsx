import { useState } from 'react';

import { Sidebar } from './components/Sidebar';
import type { AuthUser } from './lib/auth';
import { clearUser, loadUser, saveUser } from './lib/auth';
import type { Role } from './lib/roles';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Missions } from './pages/Missions';
import { StudentDetail } from './pages/StudentDetail';
import { Students } from './pages/Students';

type Page = 'dashboard' | 'students' | 'missions';

export const App = () => {
  const [user, setUser] = useState<AuthUser | null>(loadUser);
  const [page, setPage] = useState<Page>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const handleLogin = (u: AuthUser) => {
    saveUser(u);
    setUser(u);
  };

  const handleLogout = () => {
    clearUser();
    setUser(null);
    setPage('dashboard');
    setSelectedStudentId(null);
  };

  const handleRoleChange = (role: Role) => {
    if (!user) return;
    const updated = { ...user, role };
    saveUser(updated);
    setUser(updated);
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
        return <Dashboard onStudentClick={handleStudentClick} />;
      case 'students':
        return <Students onStudentClick={handleStudentClick} />;
      case 'missions':
        return <Missions />;
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
        onRoleChange={handleRoleChange}
        onLogout={handleLogout}
      />
      <main className='mr-64 min-h-screen p-8'>{renderPage()}</main>
    </div>
  );
};
