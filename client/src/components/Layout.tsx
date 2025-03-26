import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Get current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/me'],
    staleTime: Infinity,
  });

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="bg-background text-textPrimary min-h-screen">
      {/* Mobile menu toggle */}
      <div className="lg:hidden fixed z-50 top-4 left-4">
        <button 
          className="p-2 rounded-full bg-white shadow-md"
          onClick={() => setIsSidebarOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        user={user}
      />

      {/* Mobile overlay */}
      <div 
        className={`lg:hidden fixed inset-0 z-30 bg-[rgba(23,43,77,0.5)] transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Main content */}
      <main className="pt-6 px-4 sm:px-6 lg:px-8 pb-16 lg:ml-72">
        {children}
      </main>
    </div>
  );
};

export default Layout;
