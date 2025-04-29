import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import {
  HeartPulse,
  LayoutDashboard,
  MessageSquare,
  Stethoscope,
  HelpCircle,
  BookOpen,
  Brain,
  FileText,
  PillIcon,
  CalendarRange,
  FileEdit,
  Newspaper,
  Settings,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { formatTokenCount } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/chat", label: "AI Chatbot", icon: <MessageSquare className="h-5 w-5" /> },
    { href: "/diagnosis", label: "Diagnosis Tool", icon: <Stethoscope className="h-5 w-5" /> },
    { href: "/quiz", label: "Quiz Generator", icon: <HelpCircle className="h-5 w-5" /> },
    { href: "/neetpg", label: "NEET PG Prep", icon: <BookOpen className="h-5 w-5" /> },
    { href: "/memory", label: "Memory Booster", icon: <Brain className="h-5 w-5" /> },
    { href: "/cases", label: "Case Generator", icon: <FileText className="h-5 w-5" /> },
    { href: "/drugs", label: "Drug Assistant", icon: <PillIcon className="h-5 w-5" /> },
    { href: "/planner", label: "Study Planner", icon: <CalendarRange className="h-5 w-5" /> },
    { href: "/notes", label: "Notes Maker", icon: <FileEdit className="h-5 w-5" /> },
    { href: "/news", label: "Medical News", icon: <Newspaper className="h-5 w-5" /> },
  ];

  const bottomNavItems = [
    { href: "/help", label: "Help & Support", icon: <AlertCircle className="h-5 w-5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ];

  const containerClasses = cn(
    "fixed inset-y-0 left-0 bg-white shadow-lg max-w-xs w-full flex flex-col z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64",
    isOpen ? "translate-x-0" : "-translate-x-full"
  );

  return (
    <>
      <div className={containerClasses}>
        {/* Logo and close button */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-neutral-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <HeartPulse className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-neutral-800">DRNXT Learning</span>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700 lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        
        {/* Navigation items */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose()}
                >
                  <a className={cn(
                    "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? "bg-primary-50 text-primary-600" 
                      : "text-neutral-700 hover:bg-primary-50 hover:text-primary-600"
                  )}>
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-1">
            {bottomNavItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose()}
                >
                  <a className={cn(
                    "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? "bg-primary-50 text-primary-600" 
                      : "text-neutral-700 hover:bg-primary-50 hover:text-primary-600"
                  )}>
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </div>
          
          {/* Subscription status */}
          <div className="mt-6 pt-5 border-t border-neutral-200">
            <div className="px-2 py-3 bg-neutral-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-600">
                  {user?.isSubscribed ? "Premium" : "Free Trial"}
                </span>
                {!user?.isSubscribed && (
                  <span className="px-2 py-1 text-xs font-medium text-white bg-amber-500 rounded-full">
                    {formatTokenCount(user?.tokenBalance || 0)} tokens left
                  </span>
                )}
              </div>
              {!user?.isSubscribed && (
                <>
                  <div className="mt-2">
                    <div className="w-full bg-neutral-200 rounded-full h-2.5">
                      <div 
                        className="bg-amber-500 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (user?.tokenBalance || 0) / 200)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Button variant="default" size="sm" className="w-full">
                      Upgrade Plan
                    </Button>
                  </div>
                </>
              )}
              {user?.isSubscribed && (
                <div className="mt-3">
                  <Button variant="outline" size="sm" className="w-full text-green-600">
                    Active Premium Plan
                  </Button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
      
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        ></div>
      )}
    </>
  );
}
