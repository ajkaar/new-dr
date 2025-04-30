import React, { ReactNode, useState } from 'react';
import Sidebar from './sidebar';
import TopNavigation from './top-navigation';
import { useAuth } from '@/hooks/use-auth';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  title = '', 
  description = '' 
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user } = useAuth();

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar - Only visible when open */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Background overlay */}
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75" 
            onClick={toggleMobileSidebar}
          ></div>
          
          {/* Sidebar */}
          <div className="relative flex flex-col w-72 max-w-[80%] h-full bg-white">
            <Sidebar mobile={true} closeSidebar={toggleMobileSidebar} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNavigation 
          toggleSidebar={toggleMobileSidebar} 
          user={user}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {(title || description) && (
            <div className="pb-5 border-b border-gray-200">
              <h1 className="text-2xl font-nunito font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="mt-1 text-sm text-gray-500">
                  {description}
                </p>
              )}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
