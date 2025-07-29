import { Search, Bell, ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header({ sidebarOpen, setSidebarOpen }) {
  return (
    <header className="h-auto min-h-16 border-b bg-background flex flex-row items-center justify-between px-2 sm:px-6 shadow-sm z-30 sticky top-0 gap-2">
      <div className="flex items-center gap-2 sm:gap-4 py-2 sm:py-0 flex-1">
        <button
          className="md:hidden mr-2 bg-white border border-gray-200 rounded-full p-2 shadow hover:bg-gray-100 focus:outline-none"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <div className="relative flex-1 max-w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search..."
            className="pl-10 w-full h-10 rounded-lg bg-gray-50 border border-gray-200 focus:border-green-700 focus:ring-green-700 transition"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 justify-end">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full text-xs text-destructive-foreground flex items-center justify-center">
            3
          </span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-9 px-3">
              <span className="text-sm font-medium">ADMIN</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border border-gray-100 mt-2">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}