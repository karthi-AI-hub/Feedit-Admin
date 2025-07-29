import AuthLayout from '../layout/AuthLayout';
import './Login.css';
import { useNavigate } from 'react-router-dom';

export default function PasswordChanged() {
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto p-6 sm:p-8 flex flex-col items-center justify-center">
        <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mb-6">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="24" fill="#22c55e" />
            <path d="M16 25.5L22 31.5L34 19.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-center">Password Changed!</h2>
        <p className="text-gray-600 mb-6 text-center">Your password has been changed successfully.</p>
        <button className="login-btn-main w-full bg-green-700 hover:bg-green-800 py-3 text-base" onClick={e => { e.preventDefault(); navigate('/login'); }}>Done</button>
      </div>
    </AuthLayout>
  );
} 