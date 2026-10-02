import { useState, useEffect } from 'react';
import { RegistrationPage } from './pages/RegistrationPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname.startsWith('/admin') ? '/admin' : '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname.startsWith('/admin') ? '/admin' : '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#f6f2ea] font-sans antialiased selection:bg-[#d7ae55]/30 selection:text-[#f0cc77]">
      {currentPath === '/admin' ? (
        <AdminPage onNavigateToHome={() => navigateTo('/')} />
      ) : (
        <RegistrationPage onNavigateToAdmin={() => navigateTo('/admin')} />
      )}
    </div>
  );
}
