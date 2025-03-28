import { Link, useLocation } from "wouter";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

const Sidebar = ({ isOpen, onClose, user }: SidebarProps) => {
  const [location] = useLocation();
  
  console.log("Sidebar rendering, current location:", location);

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-40 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300 w-72 bg-white shadow-md overflow-y-auto`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#0052CC] rounded-md flex items-center justify-center">
              <span className="text-white font-bold">ISP</span>
            </div>
            <h1 className="ml-3 font-display font-bold text-xl">SalesBoost</h1>
          </div>
          <button 
            className="lg:hidden text-[#6B778C] hover:text-[#172B4D]"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {user && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={`${user.name}'s avatar`} 
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#0052CC] text-white flex items-center justify-center">
                  {user.name?.charAt(0)}
                </div>
              )}
              <div className="ml-3">
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-[#6B778C]">{user.role}</p>
              </div>
            </div>
            
            <div className="bg-[#FAFBFC] rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold">Monthly Target</span>
                <span className="text-xs font-semibold text-[#36B37E]">78%</span>
              </div>
              <div className="h-2 bg-[#DFE1E6] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#36B37E] rounded-full" 
                  style={{ width: "78%" }}
                />
              </div>
            </div>
          </div>
        )}
        
        <nav>
          <ul className="space-y-1">
            <li>
              <Link href="/">
                <div className={`flex items-center p-3 text-sm font-medium rounded-md cursor-pointer ${
                  location === "/" 
                    ? "bg-[#0052CC] bg-opacity-10 text-[#0052CC]" 
                    : "hover:bg-[#FAFBFC] text-[#6B778C] hover:text-[#0052CC]"
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Dashboard</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/pipeline">
                <div className={`flex items-center p-3 text-sm font-medium rounded-md cursor-pointer ${
                  location === "/pipeline" 
                    ? "bg-[#0052CC] bg-opacity-10 text-[#0052CC]" 
                    : "hover:bg-[#FAFBFC] text-[#6B778C] hover:text-[#0052CC]"
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Sales Pipeline</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/weekly-pipeline">
                <div className={`flex items-center p-3 text-sm font-medium rounded-md cursor-pointer ${
                  location === "/weekly-pipeline" 
                    ? "bg-[#0052CC] bg-opacity-10 text-[#0052CC]" 
                    : "hover:bg-[#FAFBFC] text-[#6B778C] hover:text-[#0052CC]"
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Weekly Pipeline</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/team-pipeline">
                <div className={`flex items-center p-3 text-sm font-medium rounded-md cursor-pointer ${
                  location === "/team-pipeline" 
                    ? "bg-[#0052CC] bg-opacity-10 text-[#0052CC]" 
                    : "hover:bg-[#FAFBFC] text-[#6B778C] hover:text-[#0052CC]"
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Team Pipeline</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/leaderboard">
                <div className={`flex items-center p-3 text-sm font-medium rounded-md cursor-pointer ${
                  location === "/leaderboard" 
                    ? "bg-[#0052CC] bg-opacity-10 text-[#0052CC]" 
                    : "hover:bg-[#FAFBFC] text-[#6B778C] hover:text-[#0052CC]"
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Leaderboard</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/team">
                <div className={`flex items-center p-3 text-sm font-medium rounded-md cursor-pointer ${
                  location === "/team" 
                    ? "bg-[#0052CC] bg-opacity-10 text-[#0052CC]" 
                    : "hover:bg-[#FAFBFC] text-[#6B778C] hover:text-[#0052CC]"
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Team Management</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/achievements">
                <div className={`flex items-center p-3 text-sm font-medium rounded-md cursor-pointer ${
                  location === "/achievements" 
                    ? "bg-[#0052CC] bg-opacity-10 text-[#0052CC]" 
                    : "hover:bg-[#FAFBFC] text-[#6B778C] hover:text-[#0052CC]"
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span>Achievements</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/rewards">
                <div className={`flex items-center p-3 text-sm font-medium rounded-md cursor-pointer ${
                  location === "/rewards" 
                    ? "bg-[#0052CC] bg-opacity-10 text-[#0052CC]" 
                    : "hover:bg-[#FAFBFC] text-[#6B778C] hover:text-[#0052CC]"
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Rewards & Incentives</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/profile">
                <div className={`flex items-center p-3 text-sm font-medium rounded-md cursor-pointer ${
                  location === "/profile" 
                    ? "bg-[#0052CC] bg-opacity-10 text-[#0052CC]" 
                    : "hover:bg-[#FAFBFC] text-[#6B778C] hover:text-[#0052CC]"
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>User Profile</span>
                </div>
              </Link>
            </li>
            {user && (user.role === 'admin' || user.role === 'manager') && (
              <li>
                <Link href="/admin">
                  <div className={`flex items-center p-3 text-sm font-medium rounded-md cursor-pointer ${
                    location === "/admin" 
                      ? "bg-[#0052CC] bg-opacity-10 text-[#0052CC]" 
                      : "hover:bg-[#FAFBFC] text-[#6B778C] hover:text-[#0052CC]"
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Admin Dashboard</span>
                  </div>
                </Link>
              </li>
            )}
          </ul>
        </nav>
        
        <div className="mt-6 pt-6 border-t border-[#DFE1E6]">
          <h3 className="text-xs font-semibold text-[#6B778C] uppercase tracking-wider mb-3">Sales Categories</h3>
          <div className="space-y-2">
            <a href="#" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-[#0052CC] bg-[#0052CC] bg-opacity-5">
              <span className="w-2 h-2 mr-3 rounded-full bg-blue-500"></span>
              Wireless Solutions
            </a>
            <a href="#" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-[#6B778C] hover:text-[#0052CC] hover:bg-[#0052CC] hover:bg-opacity-5">
              <span className="w-2 h-2 mr-3 rounded-full bg-green-500"></span>
              Fiber Connectivity
            </a>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-[#DFE1E6]">
          <h3 className="text-xs font-semibold text-[#6B778C] uppercase tracking-wider mb-3">Tools & Utilities</h3>
          <div className="space-y-1">
            <Link href="/import">
              <div className={`flex items-center px-3 py-2 text-sm font-medium rounded-md text-[#6B778C] hover:text-[#0052CC] ${
                location === "/import" 
                  ? "bg-[#0052CC] bg-opacity-10 text-[#0052CC]" 
                  : "hover:bg-[#FAFBFC]"
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span>CSV Import</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
