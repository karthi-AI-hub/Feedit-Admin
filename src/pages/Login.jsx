import '../pages/Login.css';
import AuthLayout from '../layout/AuthLayout';
import { useNavigate } from 'react-router-dom';
import { login, isAuthenticated } from '../services/authService';
import { useState } from 'react';
const Eye = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s3.75-7.5 10.5-7.5S22.5 12 22.5 12 18.75 19.5 12 19.5 1.5 12 1.5 12z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" /></svg>
);
const EyeOff = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.5 12s3.75 7.5 10.5 7.5c2.042 0 3.82-.385 5.287-1.022M6.222 6.222A10.45 10.45 0 0112 4.5c6.75 0 10.5 7.5 10.5 7.5a17.29 17.29 0 01-2.065 3.043M6.222 6.222L3 3m3.222 3.222l12.728 12.728" /></svg>
);


import { useEffect } from 'react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const auth = await isAuthenticated();
      if (auth && mounted) {
        navigate('/dashboard');
      }
      if (mounted) setCheckingAuth(false);
    })();
    return () => { mounted = false; };
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin" style={{ borderRightColor: 'transparent', borderLeftColor: 'transparent' }}></div>
          <span className="text-green-700 font-medium text-base">Checking authentication...</span>
        </div>
      </div>
    );
  }
  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto p-6 sm:p-8 flex flex-col items-start justify-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-left w-full">Login</h2>
        <div className="w-full text-sm text-gray-500 mb-4 text-left">Welcome back! Please sign in to your account.</div>
        
        {/* Error Display */}
        {error && (
          <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            className="login-input border-gray-300 focus:border-green-700 focus:ring-green-700"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="login-input border-gray-300 focus:border-green-700 focus:ring-green-700 pr-10"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {/* <div className="flex items-center justify-between w-full mb-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={keepLoggedIn}
                onChange={e => setKeepLoggedIn(e.target.checked)}
                className="login-checkbox"
              />
              <label className="text-gray-700 text-sm">Keep me logged in</label>
            </div>
            <a href="#" className="login-forgot-link text-sm" onClick={e => { e.preventDefault(); navigate('/forgot-password'); }}>Forgot Password?</a>
          </div> */}
          <button 
            type="submit" 
            className="login-btn-main w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                SIGNING IN...
              </div>
            ) : (
              'EMAIL LOGIN'
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}