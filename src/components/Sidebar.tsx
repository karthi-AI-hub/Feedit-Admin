import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, List, ChevronDown, FileWarning, Image } from 'lucide-react';

const menu = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Products', icon: Package, to: '/products' },
  { label: 'Customers', icon: Users, to: '/customers' },
  { label: 'Orders', icon: List, to: '/orders' },
  { label: 'Banners', icon: Image, to: '/banners' },
];

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="w-64 h-screen bg-white border-r flex flex-col overflow-y-auto">
      <div className="pt-6 pb-4 flex flex-col items-center">
        <img src="/logo.svg" alt="Feedit Logo" className="w-32 h-20 object-contain mb-2" />
      </div>
      <nav className="flex flex-col gap-0 px-4">
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
    </aside>
  );
} 