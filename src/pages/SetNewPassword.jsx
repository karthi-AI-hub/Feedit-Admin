import AuthLayout from '../layout/AuthLayout';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function SetNewPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto p-6 sm:p-8 flex flex-col items-start justify-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-left w-full">Create New Password</h2>
        <p className="mb-6 text-gray-600 text-left w-full text-sm sm:text-base">Please enter your new password below.</p>
        <form className="w-full flex flex-col gap-4" onSubmit={e => { e.preventDefault(); navigate('/password-changed'); }}>
          <div className="relative w-full">
            <input
              type={showPassword ? 'text' : 'password'}
              className="login-input border-gray-300 focus:border-green-700 focus:ring-green-700 pr-10 w-full"
              placeholder="Enter Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(v => !v)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className="relative w-full">
            <input
              type={showConfirm ? 'text' : 'password'}
              className="login-input border-gray-300 focus:border-green-700 focus:ring-green-700 pr-10 w-full"
              placeholder="Re-enter Password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              tabIndex={-1}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
              onClick={() => setShowConfirm(v => !v)}
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <button type="submit" className="login-btn-main w-full bg-green-700 hover:bg-green-800 py-3 text-base">RESET PASSWORD</button>
        </form>
        <div className="text-xs text-gray-500 mt-2 w-full text-left">NOTE : Password must be minimum of 6 characters.</div>
      </div>
    </AuthLayout>
  );
} 