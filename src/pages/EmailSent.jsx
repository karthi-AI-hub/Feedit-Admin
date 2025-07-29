import AuthLayout from '../layout/AuthLayout';
import { useNavigate } from 'react-router-dom';

export default function EmailSent() {
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto p-6 sm:p-8 flex flex-col items-start justify-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-left w-full">Email Sent</h2>
        <p className="mb-6 text-gray-600 text-left w-full text-sm sm:text-base">
          If your email address is registered, you’ll receive instructions to reset your password shortly.<br />
        </p>
        <div className="mb-2 text-gray-700 text-left text-sm w-full">
          Didn’t get the email?{' '}
          <a href="#" className="login-forgot-link" onClick={e => { e.preventDefault(); /* Optionally trigger resend logic */ }}>Resend Email</a>
        </div>
        <div className="mb-4 text-gray-700 text-left text-sm w-full">
          Entered the wrong email?{' '}
          <a href="#" className="login-forgot-link" onClick={e => { e.preventDefault(); navigate('/forgot-password'); }}>Change Email Address</a>
        </div>
        <button
          className="login-btn-main w-full bg-green-700 hover:bg-green-800"
          onClick={() => navigate('/set-new-password')}
        >
          Go to Set New Password
        </button>
      </div>
    </AuthLayout>
  );
} 