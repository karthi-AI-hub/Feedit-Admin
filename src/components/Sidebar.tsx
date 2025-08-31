import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import { LayoutDashboard, Package, Users, List, FileWarning, Image } from 'lucide-react';

const menu = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Products', icon: Package, to: '/products' },
  { label: 'Customers', icon: Users, to: '/customers' },
  { label: 'Orders', icon: List, to: '/orders' },
  { label: 'Banners', icon: Image, to: '/banners' },
  { label: 'Pincodes', icon: FileWarning, to: '/pincodes' },
];

export default function Sidebar({ onNavigate }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <aside className="w-64 h-screen bg-white border-r flex flex-col overflow-y-auto">
      <div className="pt-6 pb-4 flex flex-col items-center">
        <img src="/logo.png" alt="Feedit Logo" className="w-32 h-20 object-contain mb-2" />
      </div>
      <nav className="flex flex-col gap-0 px-4 flex-1">
        <ul className="flex flex-col gap-4">
          {menu.map(({ label, icon: Icon, to }) => (
            <li key={label}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 w-full px-4 py-3 rounded-xl transition font-medium text-base
                  ${isActive ? 'bg-green-700 text-white' : 'text-black hover:bg-gray-100'}
                  `
                }
                end={label === 'Dashboard'}
                onClick={() => onNavigate && onNavigate()}
              >
                <Icon size={22} className="text-inherit" />
                {label.toUpperCase()}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-4 pb-6 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-base bg-red-50 text-red-700 hover:bg-red-100 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          LOGOUT
        </button>
      </div>
    </aside>
  );
}