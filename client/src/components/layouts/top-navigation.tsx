import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Menu, 
  Bell, 
  HelpCircle,
  Search,
  LogOut,
  Settings,
  User
} from 'lucide-react';
import { User as UserType } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

interface TopNavigationProps {
  toggleSidebar: () => void;
  user: UserType | null;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ toggleSidebar, user }) => {
  const { logoutMutation } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchTerm);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const ProfileMenuItem = () => {
    const [, setLocation] = useLocation();
    return (
      <div onClick={() => setLocation("/profile")} className="cursor-pointer">
        <User className="mr-2 h-4 w-4" />
        <span>Profile</span>
      </div>
    );
  };

  const SettingsMenuItem = () => {
    const [, setLocation] = useLocation();
    return (
      <div onClick={() => setLocation("/settings")} className="cursor-pointer">
        <Settings className="mr-2 h-4 w-4" />
        <span>Settings</span>
      </div>
    );
  };


  return (
    <div className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button 
              type="button" 
              className="md:hidden px-4 text-gray-500 focus:outline-none"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-shrink-0 flex items-center md:hidden">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="ml-2 text-primary font-nunito font-bold text-lg">DRNXT</span>
            </div>
            <div className="hidden md:ml-4 md:flex">
              <form onSubmit={handleSearch} className="relative max-w-xs w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  className="block w-80 pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  type="search"
                  placeholder="Search medical topics, drugs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
            </div>
          </div>

          <div className="flex items-center ml-4 md:ml-6 space-x-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary relative">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-1 right-1 inline-block w-2 h-2 bg-destructive rounded-full transform translate-x-1/2 -translate-y-1/2"></span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="py-2 px-4 text-center text-sm text-muted-foreground">
                  You have no unread notifications
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Help */}
            <Link href="/help-support">
              <a className="p-1 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                <HelpCircle className="h-6 w-6" />
              </a>
            </Link>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>{user ? getInitials(user.fullName) : 'U'}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user?.fullName || 'User'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <ProfileMenuItem />
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <SettingsMenuItem />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;