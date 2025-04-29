import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { 
  Bell, 
  Search, 
  Mic, 
  Menu,
  ChevronDown,
  LogOut,
  User,
  CreditCard,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/lib/utils";

interface HeaderProps {
  toggleSidebar: () => void;
  title: string;
}

export function Header({ toggleSidebar, title }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const pageTitles: Record<string, string> = {
    "/": "Dashboard",
    "/chat": "AI Chatbot",
    "/diagnosis": "Diagnosis Tool",
    "/quiz": "Quiz Generator",
    "/neetpg": "NEET PG Prep",
    "/memory": "Memory Booster",
    "/cases": "Case Generator",
    "/drugs": "Drug Assistant",
    "/planner": "Study Planner",
    "/notes": "Notes Maker",
    "/news": "Medical News",
    "/help": "Help & Support",
    "/settings": "Settings",
  };

  return (
    <header className="bg-white shadow-sm z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button 
              onClick={toggleSidebar} 
              className="text-neutral-500 focus:outline-none lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="ml-4 lg:ml-0">
              <h1 className="text-xl font-semibold text-neutral-800">
                {title || "DRNXT Learning"}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search button */}
            <button 
              onClick={() => setIsSearchOpen(true)} 
              className="p-1 text-neutral-500 hover:text-neutral-700 focus:outline-none"
            >
              <Search className="h-5 w-5" />
            </button>
            
            {/* Voice assistant button */}
            <button className="p-1 text-neutral-500 hover:text-neutral-700 focus:outline-none">
              <Mic className="h-5 w-5" />
            </button>
            
            {/* Notifications dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-64 overflow-y-auto">
                  <DropdownMenuItem className="cursor-pointer py-3">
                    <div className="flex">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <BookIcon className="h-4 w-4 text-primary-500" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium">New NEET PG questions added</p>
                        <p className="text-xs text-muted-foreground mt-0.5">5 minutes ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer py-3">
                    <div className="flex">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CalendarIcon className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium">Study plan updated for today</p>
                        <p className="text-xs text-muted-foreground mt-0.5">1 hour ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer py-3">
                    <div className="flex">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <NewsIcon className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium">NEET PG exam date announced</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Yesterday</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <span className="text-xs font-medium text-primary">View all notifications</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 flex items-center space-x-2 focus:ring-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(user?.fullName || user?.username || "")}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium">
                    {user?.fullName || user?.username || "User"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.fullName || user?.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setLocation("/settings")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Subscription</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Search dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <div className="flex items-center">
            <Search className="h-5 w-5 text-muted-foreground mr-2" />
            <Input
              placeholder="Search for topics, questions, drugs..."
              className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
          </div>
          <div className="max-h-96 overflow-y-auto py-2">
            <div className="px-1 py-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Searches</h4>
              <div className="mt-2 space-y-1">
                <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2">Cardiac arrhythmias</Button>
                <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2">Treatment of diabetes mellitus</Button>
                <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2">Antibiotic resistance</Button>
              </div>
            </div>
            <div className="px-1 py-2 mt-3 border-t border-border">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Suggested Topics</h4>
              <div className="mt-2 space-y-1">
                <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2">Respiratory system diseases</Button>
                <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2">Neurology case studies</Button>
                <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2">NEET PG previous questions</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}

function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function NewsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" />
      <path d="M15 18h-5" />
      <path d="M10 6h8v4h-8V6Z" />
    </svg>
  );
}
