import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const RecentActivities = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/activities'], 
    queryFn: async () => {
      const res = await fetch('/api/activities?limit=5');
      if (!res.ok) throw new Error('Failed to fetch activities');
      return res.json();
    }
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deal_created':
        return (
          <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-[#0052CC] text-white flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'deal_won':
        return (
          <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-[#36B37E] text-white flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'achievement_earned':
        return (
          <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-[#FFAB00] text-white flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-[#FF5630] text-white flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
        );
    }
  };

  const getActivityTitle = (type: string) => {
    switch (type) {
      case 'deal_created': return 'New Deal Created';
      case 'deal_won': return 'Deal Won';
      case 'achievement_earned': return 'Achievement Unlocked';
      default: return 'Activity';
    }
  };

  const formatTimeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-6 py-5 border-b border-[#DFE1E6]">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Recent Activities</CardTitle>
          <button className="text-[#0052CC] text-sm font-medium hover:underline">
            View All
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="relative pl-10">
                <Skeleton className="absolute left-0 top-1 w-8 h-8 rounded-full" />
                <Skeleton className="w-full h-28 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-[#DFE1E6]"></div>
            
            {activities && activities.map((activity: any, index: number) => (
              <div key={activity.id} className="relative mb-6 pl-10">
                {getActivityIcon(activity.type)}
                <div className="bg-[#FAFBFC] rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium">{getActivityTitle(activity.type)}</h4>
                    <span className="text-xs text-[#6B778C]">{formatTimeSince(activity.createdAt)}</span>
                  </div>
                  <p className="text-sm text-[#6B778C] mt-1">{activity.content}</p>
                  
                  {activity.type === 'deal_created' && activity.metadata?.dealCategory && (
                    <div className="mt-3 flex items-center">
                      <span className={`px-2.5 py-1 ${
                        activity.metadata.dealCategory === 'wireless' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      } rounded text-xs font-medium`}>
                        {activity.metadata.dealCategory === 'wireless' ? 'Wireless' : 'Fiber'}
                      </span>
                      {activity.metadata.region && (
                        <span className="ml-2 text-xs text-[#6B778C]">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {activity.metadata.region}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {activity.type === 'achievement_earned' && activity.metadata?.achievementIcon && (
                    <div className="mt-3 flex justify-center">
                      <div className="w-12 h-12 bg-[#FFAB00] bg-opacity-10 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#FFAB00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {(!activities || activities.length === 0) && (
              <div className="text-center py-6">
                <p className="text-[#6B778C]">No recent activities found</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
