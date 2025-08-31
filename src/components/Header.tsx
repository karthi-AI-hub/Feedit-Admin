import { ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { logout } from '../services/authService';

export function Header({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b bg-white flex flex-row items-center justify-between px-4 sm:px-6 shadow-sm z-30 sticky top-0">
      <div className="flex items-center gap-4 flex-1">
        <button
          className="md:hidden bg-white border border-gray-300 rounded-lg p-2 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      {/* Centered Title */}
      <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
        <h1 className="text-xl font-bold text-green-600">Feedit Admin Panel</h1>
      </div>
      
      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 h-10 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-transparent hover:border-gray-200"
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">A</span>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">ADMIN</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-lg shadow-lg border border-gray-200 mt-2 bg-white">
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700 cursor-pointer rounded-md m-1 transition-colors duration-150"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}