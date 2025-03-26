import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import KpiCard from "@/components/dashboard/KpiCard";
import SalesPipelineWidget from "@/components/dashboard/SalesPipelineWidget";
import LeaderboardWidget from "@/components/dashboard/LeaderboardWidget";
import PerformanceOverview from "@/components/dashboard/PerformanceOverview";
import RecentActivities from "@/components/dashboard/RecentActivities";

const Dashboard = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
  });

  return (
    <>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 mt-12 lg:mt-0">
        <div>
          <h1 className="text-2xl font-display font-bold">Sales Dashboard</h1>
          <p className="text-[#6B778C] mt-1">Track performance, targets, and achievements</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="relative">
            <button className="flex items-center px-4 py-2 border border-[#DFE1E6] rounded-md bg-white text-sm font-medium hover:bg-[#FAFBFC] focus:outline-none">
              <span>This Month</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-[#6B778C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <button className="px-4 py-2 bg-[#0052CC] text-white rounded-md text-sm font-medium hover:bg-opacity-90 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>New Deal</span>
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          <>
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </>
        ) : (
          <>
            <KpiCard 
              label="Total Revenue" 
              value={dashboardData?.totalRevenue.toLocaleString() || '0'}
              comparison="vs last month"
              trend={14.5}
              prefix="$"
              icon={
                <div className="bg-[#0052CC] bg-opacity-10 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0052CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              }
            />
            
            <KpiCard 
              label="Deals Won" 
              value={dashboardData?.dealsWon || '0'}
              comparison="vs last month"
              trend={8.2}
              icon={
                <div className="bg-[#36B37E] bg-opacity-10 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#36B37E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              }
            />
            
            <KpiCard 
              label="Active Leads" 
              value={dashboardData?.activeLeads || '0'}
              comparison="vs last month"
              trend={-3.8}
              icon={
                <div className="bg-[#FFAB00] bg-opacity-10 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FFAB00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              }
            />
            
            <KpiCard 
              label="GP Achieved" 
              value={dashboardData?.gpPercentage || '0'}
              comparison="vs last month"
              trend={5.3}
              suffix="%"
              icon={
                <div className="bg-[#FF5630] bg-opacity-10 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FF5630]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
              }
            />
          </>
        )}
      </div>

      {/* Sales Pipeline and Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <SalesPipelineWidget />
        </div>
        <div>
          <LeaderboardWidget />
        </div>
      </div>

      {/* Performance Overview and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceOverview />
        </div>
        <div>
          <RecentActivities />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
