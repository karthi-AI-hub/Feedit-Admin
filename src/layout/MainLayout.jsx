import { useState, useEffect, useRef} from 'react';
import Sidebar from '@/components/Sidebar';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';

import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const timerRef = useRef();
  const navigate = useNavigate();
  const INACTIVITY_LIMIT = 20 * 60 * 1000;

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        logout();
        navigate('/login', { replace: true });
      }, INACTIVITY_LIMIT);
    };
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [navigate]);

  const handleSidebarNavigate = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="hidden md:block fixed top-0 left-0 h-screen w-64 bg-white border-r-2 border-gray-200 shadow-lg z-30">
        <Sidebar />
      </div>
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 transition-opacity md:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white z-50 shadow-lg transition-transform duration-200 md:hidden">
            <Sidebar onNavigate={handleSidebarNavigate} />
          </div>
        </>
      )}
      <div className="flex-1 min-w-0 flex flex-col overflow-x-auto md:ml-64">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 w-full max-w-full px-4 pt-4 sm:px-6 sm:pt-6 md:px-8 md:pt-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}