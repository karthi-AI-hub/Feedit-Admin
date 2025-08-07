import AuthLayout from '../layout/AuthLayout';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Add your password reset logic here
      // For now, simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/email-sent');
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto p-6 sm:p-8 flex flex-col items-start justify-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-left w-full">Forgot Password</h2>
        <p className="mb-6 text-gray-600 text-left w-full text-sm sm:text-base">
          Enter your registered email address and we'll send you instructions to reset your password.<br />
        </p>
        
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
          <button 
            type="submit" 
            className="login-btn-main w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                SENDING EMAIL...
              </div>
            ) : (
              'SEND EMAIL'
            )}
          </button>
        </form>
        <div className="mt-4 text-gray-700 text-left text-sm w-full">
          Remember password?{' '}
          <a href="#" className="login-forgot-link" onClick={e => { e.preventDefault(); navigate('/login'); }}>Login</a>
        </div>
      </div>
    </AuthLayout>
  );
}