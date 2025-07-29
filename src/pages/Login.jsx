import AuthLayout from '../layout/AuthLayout';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto p-6 sm:p-8 flex flex-col items-start justify-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-left w-full">Login</h2>
        <div className="w-full text-sm text-gray-500 mb-4 text-left">Welcome back! Please sign in to your account.</div>
        <form className="w-full flex flex-col gap-4" onSubmit={e => { e.preventDefault(); navigate('/dashboard'); }}>
          <input
            type="email"
            className="login-input border-gray-300 focus:border-green-700 focus:ring-green-700"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="login-input border-gray-300 focus:border-green-700 focus:ring-green-700"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <div className="flex items-center justify-between w-full mb-2">
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
          </div>
          <button type="submit" className="login-btn-main w-full bg-green-700 hover:bg-green-800">EMAIL LOGIN</button>
        </form>
      </div>
    </AuthLayout>
  );
}
