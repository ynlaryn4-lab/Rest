import { useState, useEffect } from 'react';
import { RegistrationPage } from './pages/RegistrationPage';
import { AdminPage } from './pages/AdminPage';

function checkIsAdmin(): boolean {
  const hash = window.location.hash.toLowerCase();
  const path = window.location.pathname.toLowerCase();
  return hash.includes('admin') || path.endsWith('/admin') || path.includes('/admin');
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState<boolean>(checkIsAdmin);

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdmin(checkIsAdmin());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    if (path === '/admin') {
      window.location.hash = 'admin';
      setIsAdmin(true);
    } else {
      window.location.hash = '';
      setIsAdmin(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#f6f2ea] font-sans antialiased selection:bg-[#d7ae55]/30 selection:text-[#f0cc77]">
      {isAdmin ? (
        <AdminPage onNavigateToHome={() => navigateTo('/')} />
      ) : (
        <RegistrationPage onNavigateToAdmin={() => navigateTo('/admin')} />
      )}
    </div>
  );
}
