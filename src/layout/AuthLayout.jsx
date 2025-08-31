import React from 'react';

export default function AuthLayout({ children }) {
  return (
    <div className="w-full flex flex-col md:flex-row bg-gray-50 h-auto min-h-0">
      <div className="w-full md:w-1/2 min-h-[40vh] md:min-h-screen flex items-center justify-center bg-[url('/assets/frames/login_frame.png')] bg-center bg-cover mt-8 md:mt-0" />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-white">
        {children}
      </div>
    </div>
  );
}