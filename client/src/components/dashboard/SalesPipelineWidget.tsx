import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SalesPipelineWidget = () => {
  const { data: pipelineData, isLoading } = useQuery({
    queryKey: ['/api/pipeline'],
  });

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['/api/dashboard'],
  });

  // Process data for pipeline stages
  const stageData = useMemo(() => {
    if (!dashboardData) return null;

    return {
      prospecting: {
        count: dashboardData.dealsByStage.prospecting || 0,
        value: formatCurrency(dashboardData.revenueByStage.prospecting || 0)
      },
      qualification: {
        count: dashboardData.dealsByStage.qualification || 0,
        value: formatCurrency(dashboardData.revenueByStage.qualification || 0)
      },
      proposal: {
        count: dashboardData.dealsByStage.proposal || 0,
        value: formatCurrency(dashboardData.revenueByStage.proposal || 0)
      },
      negotiation: {
        count: dashboardData.dealsByStage.negotiation || 0,
        value: formatCurrency(dashboardData.revenueByStage.negotiation || 0)
      },
      closed_won: {
        count: dashboardData.dealsByStage.closed_won || 0,
        value: formatCurrency(dashboardData.revenueByStage.closed_won || 0)
      }
    };
  }, [dashboardData]);

  // Helper function to format currency
  function formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-6 py-5 border-b border-[#DFE1E6]">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Sales Pipeline</CardTitle>
          <div className="flex">
            <button className="px-3 py-1.5 text-xs font-medium bg-[#0052CC] text-white rounded-md mr-2">
              All Deals
            </button>
            <button className="px-3 py-1.5 text-xs font-medium bg-white border border-[#DFE1E6] text-[#6B778C] rounded-md">
              My Deals
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading || isDashboardLoading ? (
          <>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="w-full h-20 mb-2 rounded-md" />
                  <Skeleton className="h-4 w-3/4 mx-auto mb-2" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="w-full h-24 rounded-lg" />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-5 gap-2 mb-6">
              <PipelineStage 
                count={stageData?.prospecting.count || 0}
                value={stageData?.prospecting.value || "$0"}
                label="Prospecting"
              />
              <PipelineStage 
                count={stageData?.qualification.count || 0}
                value={stageData?.qualification.value || "$0"}
                label="Qualification"
              />
              <PipelineStage 
                count={stageData?.proposal.count || 0}
                value={stageData?.proposal.value || "$0"}
                label="Proposal"
              />
              <PipelineStage 
                count={stageData?.negotiation.count || 0}
                value={stageData?.negotiation.value || "$0"}
                label="Negotiation"
              />
              <PipelineStage 
                count={stageData?.closed_won.count || 0}
                value={stageData?.closed_won.value || "$0"}
                label="Closed Won"
                highlight
              />
            </div>
            
            {pipelineData && pipelineData.slice(0, 3).map((deal: any) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
            
            <div className="mt-4 text-center">
              <button className="px-4 py-2 text-[#0052CC] text-sm font-medium hover:underline focus:outline-none">
                View All Deals
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

interface PipelineStageProps {
  count: number;
  value: string;
  label: string;
  highlight?: boolean;
}

const PipelineStage = ({ count, value, label, highlight = false }: PipelineStageProps) => {
  return (
    <div className="text-center">
      <div className={`w-full h-20 ${highlight ? 'bg-[#36B37E] bg-opacity-10' : 'bg-[#FAFBFC]'} rounded-md flex items-center justify-center mb-2`}>
        <span className={`text-xl font-display font-bold ${highlight ? 'text-[#36B37E]' : ''}`}>{count}</span>
      </div>
      <span className="text-xs text-[#6B778C]">{label}</span>
      <p className={`text-xs font-semibold mt-1 ${highlight ? 'text-[#36B37E]' : ''}`}>{value}</p>
    </div>
  );
};

interface DealCardProps {
  deal: any;
}

const DealCard = ({ deal }: DealCardProps) => {
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'proposal': return 'text-[#0052CC]';
      case 'negotiation': return 'text-[#FFAB00]';
      case 'qualification': return 'text-[#FF5630]';
      case 'closed_won': return 'text-[#36B37E]';
      default: return 'text-[#6B778C]';
    }
  };

  const getCategoryDot = (category: string) => {
    return category === 'wireless' ? 'bg-blue-500' : 'bg-green-500';
  };

  const formatStage = (stage: string) => {
    return stage.charAt(0).toUpperCase() + stage.slice(1).replace('_', ' ');
  };

  return (
    <motion.div 
      className="rounded-lg p-4 mb-3 border border-[#DFE1E6] hover:cursor-pointer hover:bg-[rgba(0,82,204,0.05)]"
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center">
            <span className={`w-2 h-2 rounded-full ${getCategoryDot(deal.category)} mr-2`}></span>
            <h4 className="font-medium text-sm">{deal.name}</h4>
          </div>
          <p className="text-xs text-[#6B778C] mt-1">
            {deal.clientType} • {deal.category === 'wireless' ? 'Wireless Solutions' : 'Fiber Connectivity'}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">${deal.value.toLocaleString()}</p>
          <p className={`text-xs ${getStageColor(deal.stage)} mt-1`}>
            {formatStage(deal.stage)} • {deal.daysInStage} days
          </p>
        </div>
      </div>
      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center">
          {deal.user && (
            <>
              {deal.user.avatar ? (
                <img src={deal.user.avatar} alt={deal.user.name} className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#0052CC] text-white flex items-center justify-center text-xs">
                  {deal.user.name.charAt(0)}
                </div>
              )}
              <p className="text-xs text-[#6B778C] ml-2">{deal.user.name}</p>
            </>
          )}
        </div>
        <div className="flex">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium mr-2">
            {deal.category === 'wireless' ? 'Wireless' : 'Fiber'}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
            {deal.clientType}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default SalesPipelineWidget;
