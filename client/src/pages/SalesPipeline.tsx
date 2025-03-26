import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import PipelineStageColumn from "@/components/pipeline/PipelineStageColumn";
import DealCard from "@/components/pipeline/DealCard";

const SalesPipeline = () => {
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterTeam, setFilterTeam] = useState("all");

  // Fetch pipeline data
  const { data: pipelineData, isLoading } = useQuery({
    queryKey: ['/api/pipeline'],
  });

  // Filter pipeline data based on category and team
  const filteredPipeline = pipelineData ? pipelineData.filter((deal: any) => {
    return (
      (filterCategory === "all" || deal.category === filterCategory) &&
      (filterTeam === "all" || (filterTeam === "internal" ? !deal.user.isChannelPartner : deal.user.isChannelPartner))
    );
  }) : [];

  // Group deals by stage
  const dealsByStage = filteredPipeline.reduce((acc: any, deal: any) => {
    if (!acc[deal.stage]) {
      acc[deal.stage] = [];
    }
    acc[deal.stage].push(deal);
    return acc;
  }, {
    prospecting: [],
    qualification: [],
    proposal: [],
    negotiation: [],
    closed_won: [],
  });

  // Calculate stage totals
  const stageTotals = Object.keys(dealsByStage).reduce((acc: any, stage: string) => {
    const stageDeals = dealsByStage[stage] || [];
    acc[stage] = {
      count: stageDeals.length,
      value: stageDeals.reduce((sum: number, deal: any) => sum + deal.value, 0)
    };
    return acc;
  }, {});

  return (
    <>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 mt-12 lg:mt-0">
        <div>
          <h1 className="text-2xl font-display font-bold">Sales Pipeline</h1>
          <p className="text-[#6B778C] mt-1">Track your deals from lead to close</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-3">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="wireless">Wireless</SelectItem>
                <SelectItem value="fiber">Fiber</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterTeam} onValueChange={setFilterTeam}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="partner">Channel Partners</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <button className="px-4 py-2 bg-[#0052CC] text-white rounded-md text-sm font-medium hover:bg-opacity-90 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>New Deal</span>
          </button>
        </div>
      </div>

      {/* Pipeline stages */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[500px] w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <PipelineStageColumn 
            title="Prospecting" 
            count={stageTotals.prospecting.count}
            value={stageTotals.prospecting.value}
          >
            {dealsByStage.prospecting.map((deal: any) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </PipelineStageColumn>
          
          <PipelineStageColumn 
            title="Qualification" 
            count={stageTotals.qualification.count}
            value={stageTotals.qualification.value}
          >
            {dealsByStage.qualification.map((deal: any) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </PipelineStageColumn>
          
          <PipelineStageColumn 
            title="Proposal" 
            count={stageTotals.proposal.count}
            value={stageTotals.proposal.value}
          >
            {dealsByStage.proposal.map((deal: any) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </PipelineStageColumn>
          
          <PipelineStageColumn 
            title="Negotiation" 
            count={stageTotals.negotiation.count}
            value={stageTotals.negotiation.value}
          >
            {dealsByStage.negotiation.map((deal: any) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </PipelineStageColumn>
          
          <PipelineStageColumn 
            title="Closed Won" 
            count={stageTotals.closed_won.count}
            value={stageTotals.closed_won.value}
            highlight
          >
            {dealsByStage.closed_won.map((deal: any) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </PipelineStageColumn>
        </div>
      )}

      {/* Pipeline stats */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Pipeline Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-[#FAFBFC] rounded-lg">
              <h3 className="text-sm font-medium text-[#6B778C]">Total Pipeline Value</h3>
              <p className="text-2xl font-bold mt-2">
                ${isLoading 
                  ? <Skeleton className="h-8 w-24 inline-block" />
                  : Object.values(stageTotals).reduce((sum: number, stage: any) => sum + stage.value, 0).toLocaleString()}
              </p>
              <div className="mt-2 h-1 bg-[#DFE1E6] rounded">
                <div className="h-full bg-[#0052CC] rounded" style={{ width: "70%" }}></div>
              </div>
            </div>
            
            <div className="p-4 bg-[#FAFBFC] rounded-lg">
              <h3 className="text-sm font-medium text-[#6B778C]">Average Deal Size</h3>
              <p className="text-2xl font-bold mt-2">
                ${isLoading 
                  ? <Skeleton className="h-8 w-24 inline-block" />
                  : (filteredPipeline.length > 0 
                      ? Math.round(filteredPipeline.reduce((sum: number, deal: any) => sum + deal.value, 0) / filteredPipeline.length) 
                      : 0).toLocaleString()}
              </p>
              <div className="flex items-center mt-2 text-xs">
                <span className="text-[#36B37E] font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  +12.5%
                </span>
                <span className="text-[#6B778C] ml-1">vs last month</span>
              </div>
            </div>
            
            <div className="p-4 bg-[#FAFBFC] rounded-lg">
              <h3 className="text-sm font-medium text-[#6B778C]">Conversion Rate</h3>
              <p className="text-2xl font-bold mt-2">
                {isLoading 
                  ? <Skeleton className="h-8 w-24 inline-block" />
                  : (filteredPipeline.length > 0 
                      ? Math.round((stageTotals.closed_won.count / filteredPipeline.length) * 100) 
                      : 0)}%
              </p>
              <div className="flex items-center mt-2 text-xs">
                <span className="text-[#FF5630] font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  -2.3%
                </span>
                <span className="text-[#6B778C] ml-1">vs last month</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default SalesPipeline;
