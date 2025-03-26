import { motion } from "framer-motion";

interface DealCardProps {
  deal: {
    id: number;
    name: string;
    value: number;
    category: string;
    stage: string;
    clientType: string;
    daysInStage: number;
    user: {
      name: string;
      avatar?: string;
    };
    customer: {
      name: string;
    };
  };
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
      className="rounded-lg p-4 border border-[#DFE1E6] bg-white hover:cursor-pointer hover:bg-[rgba(0,82,204,0.05)]"
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center">
            <span className={`w-2 h-2 rounded-full ${getCategoryDot(deal.category)} mr-2`}></span>
            <h4 className="font-medium text-sm truncate max-w-[110px] sm:max-w-[150px]">{deal.name}</h4>
          </div>
          <p className="text-xs text-[#6B778C] mt-1 truncate max-w-[110px] sm:max-w-[150px]">
            {deal.clientType} • {deal.category === 'wireless' ? 'Wireless' : 'Fiber'}
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
              <p className="text-xs text-[#6B778C] ml-2 truncate max-w-[40px] sm:max-w-[80px]">{deal.user.name}</p>
            </>
          )}
        </div>
        <div className="flex">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
            {deal.category === 'wireless' ? 'Wireless' : 'Fiber'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default DealCard;
