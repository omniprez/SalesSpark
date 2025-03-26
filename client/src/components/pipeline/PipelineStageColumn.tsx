import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface PipelineStageColumnProps {
  title: string;
  count: number;
  value: number;
  highlight?: boolean;
  children: ReactNode;
}

const PipelineStageColumn = ({ 
  title, 
  count, 
  value, 
  highlight = false, 
  children 
}: PipelineStageColumnProps) => {
  // Format currency value
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className={`p-4 ${highlight ? 'bg-[#36B37E] bg-opacity-10' : 'bg-[#FAFBFC]'}`}>
        <div className="text-center">
          <span className={`text-xl font-display font-bold ${highlight ? 'text-[#36B37E]' : ''}`}>
            {count}
          </span>
          <p className="text-xs text-[#6B778C] mt-1">{title}</p>
          <p className={`text-xs font-semibold mt-1 ${highlight ? 'text-[#36B37E]' : ''}`}>
            {formattedValue}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-3 overflow-y-auto max-h-[500px]">
        <div className="space-y-3">
          {children}
          {count === 0 && (
            <div className="text-center py-8 text-[#6B778C] text-sm">
              <p>No deals in this stage</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PipelineStageColumn;
