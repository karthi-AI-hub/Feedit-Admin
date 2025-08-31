import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { isAuthenticated } from '../services/authService';

export default function PrivateRoute() {
  const [auth, setAuth] = useState(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const result = await isAuthenticated();
      if (mounted) setAuth(result);
    })();
    return () => { mounted = false; };
  }, []);

  if (auth === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <svg className="animate-spin w-12 h-12 text-green-700" viewBox="0 0 50 50">
              <circle className="opacity-20" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="6" fill="none" />
              <circle className="opacity-80" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="6" fill="none" strokeDasharray="100" strokeDashoffset="60" />
            </svg>
            <span className="sr-only">Checking authentication...</span>
          </div>
          <span className="text-green-700 font-medium text-base">Checking authentication...</span>
        </div>
      </div>
    );
  }
  return auth ? <Outlet /> : <Navigate to="/login" replace />;
}
