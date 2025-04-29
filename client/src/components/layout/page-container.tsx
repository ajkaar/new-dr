import { useState } from "react";
import { useLocation } from "wouter";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

interface PageContainerProps {
  children: React.ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  
  // Get the current page title based on the location
  const getPageTitle = () => {
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
    
    return pageTitles[location] || "DRNXT Learning";
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-neutral-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} title={getPageTitle()} />
        
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
