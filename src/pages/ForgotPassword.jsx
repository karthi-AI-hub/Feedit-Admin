import AuthLayout from '../layout/AuthLayout';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto p-6 sm:p-8 flex flex-col items-start justify-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-left w-full">Forgot Password</h2>
        <p className="mb-6 text-gray-600 text-left w-full text-sm sm:text-base">
          Enter your registered email address and we’ll send you instructions to reset your password.<br />
        </p>
        <form className="w-full flex flex-col gap-4" onSubmit={e => { e.preventDefault(); navigate('/email-sent'); }}>
          <input
            type="email"
            className="login-input border-gray-300 focus:border-green-700 focus:ring-green-700"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="login-btn-main w-full bg-green-700 hover:bg-green-800">SEND EMAIL</button>
        </form>
        <div className="mt-4 text-gray-700 text-left text-sm w-full">
          Remember password?{' '}
          <a href="#" className="login-forgot-link" onClick={e => { e.preventDefault(); navigate('/login'); }}>Login</a>
        </div>
      </div>
    </AuthLayout>
  );
} 