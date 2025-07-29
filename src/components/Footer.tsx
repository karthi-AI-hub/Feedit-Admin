import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-white text-gray-500 text-sm py-4 px-4 flex items-center justify-center font-medium tracking-wide mt-auto">
      <span>&copy; {new Date().getFullYear()} Feedit Admin Panel. All rights reserved.</span>
    </footer>
  );
} 