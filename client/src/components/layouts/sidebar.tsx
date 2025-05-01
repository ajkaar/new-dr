import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { 
  LayoutDashboard, 
  Bot, 
  Stethoscope, 
  HelpCircle, 
  BookOpen, 
  Brain, 
  ClipboardList, 
  Mic, 
  Pill, 
  CalendarClock, 
  FileText, 
  Newspaper,
  Crown,
  X,
  Volume2
} from 'lucide-react';

interface SidebarProps {
  mobile?: boolean;
  closeSidebar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  mobile = false, 
  closeSidebar 
}) => {
  const [location] = useLocation();
  const { user } = useAuth();

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: '/ai-chat', label: 'AI Chatbot', icon: <Bot className="h-5 w-5" /> },
    { path: '/voice-assistant', label: 'Voice Assistant', icon: <Volume2 className="h-5 w-5" /> },
    { path: '/diagnosis-tool', label: 'Diagnosis Tool', icon: <Stethoscope className="h-5 w-5" /> },
    { path: '/quiz-generator', label: 'Quiz Generator', icon: <HelpCircle className="h-5 w-5" /> },
    { path: '/neet-pg', label: 'NEET PG Prep', icon: <BookOpen className="h-5 w-5" /> },
    { path: '/memory-booster', label: 'Memory Booster', icon: <Brain className="h-5 w-5" /> },
    { path: '/case-generator', label: 'Case Generator', icon: <ClipboardList className="h-5 w-5" /> },
    { path: '/drug-assistant', label: 'Drug Assistant', icon: <Pill className="h-5 w-5" /> },
    { path: '/study-planner', label: 'Study Planner', icon: <CalendarClock className="h-5 w-5" /> },
    { path: '/notes-maker', label: 'Notes Maker', icon: <FileText className="h-5 w-5" /> },
    { path: '/med-feed', label: 'MedFeed', icon: <Newspaper className="h-5 w-5" /> },
  ];

  // Add admin link if user is admin
  if (user?.role === 'admin') {
    navigationItems.push({ path: '/admin', label: 'Admin Panel', icon: <Crown className="h-5 w-5" /> });
  }

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 bg-primary">
        {mobile && (
          <button 
            className="absolute right-4 top-4 text-white"
            onClick={closeSidebar}
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="ml-2 text-white font-nunito font-bold text-lg">DRNXT Learning</span>
      </div>
      
      <div className="flex flex-col flex-grow overflow-y-auto scrollbar-hide">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigationItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={mobile && closeSidebar}
              >
                <a className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-md group
                  ${isActive 
                    ? 'text-white bg-primary' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}>
                  <span className={`mr-3 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </a>
              </Link>
            );
          })}

          {/* Help & Support link at the bottom */}
          <Link 
            href="/help-support"
            onClick={mobile && closeSidebar}
          >
            <a className={`
              flex items-center px-4 py-3 text-sm font-medium rounded-md group mt-4 border-t border-gray-100 pt-4
              ${location === '/help-support' 
                ? 'text-white bg-primary' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }
            `}>
              <span className={`mr-3 ${location === '/help-support' ? 'text-white' : 'text-gray-500'}`}>
                <HelpCircle className="h-5 w-5" />
              </span>
              Help & Support
            </a>
          </Link>
        </nav>
        
        {/* Subscription Banner */}
        <div className="p-4 mt-auto">
          <div className="bg-primary-50 rounded-lg p-4">
            <div className="flex items-center">
              <Crown className="h-5 w-5 text-yellow-500" />
              <h3 className="ml-2 text-sm font-medium text-primary-800">
                {user?.subscriptionStatus === 'free_trial' ? 'Free Trial' : 'Premium'}
              </h3>
            </div>
            <p className="text-xs text-primary-700 mt-2">
              You have used {user?.tokenUsage?.toLocaleString()}/{user?.tokenLimit?.toLocaleString()} tokens.
            </p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-2 bg-primary rounded-full" 
                style={{ 
                  width: `${Math.min(
                    Math.round((user?.tokenUsage || 0) / (user?.tokenLimit || 1) * 100), 
                    100
                  )}%` 
                }}
              ></div>
            </div>
            {user?.subscriptionStatus === 'free_trial' && (
              <button className="mt-3 w-full px-3 py-2 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                Upgrade Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
