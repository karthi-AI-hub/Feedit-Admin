import '../pages/Login.css';
import AuthLayout from '../layout/AuthLayout';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Add your authentication logic here
      // For now, simulate a login delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <input
            type="password"
            className="login-input border-gray-300 focus:border-green-700 focus:ring-green-700"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
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