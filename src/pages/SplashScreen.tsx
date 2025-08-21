
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center justify-center w-full max-w-xs sm:max-w-md mx-auto p-6 sm:p-10">
        <img src="/logo.png" alt="Feedit Logo" className="w-28 h-28 mx-auto mb-6 drop-shadow-lg" />
        <h1 className="text-4xl sm:text-5xl font-extrabold text-green-700 mb-2 text-center">Feedit</h1>
        <p className="text-lg sm:text-xl text-gray-600 font-medium mb-8 text-center">Admin Panel</p>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Loader className="h-6 w-6 animate-spin text-green-700" />
          <span className="text-base text-gray-500">Loading...</span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
