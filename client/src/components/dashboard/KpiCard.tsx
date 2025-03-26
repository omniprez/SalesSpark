import { motion } from "framer-motion";

interface KpiCardProps {
  label: string;
  value: string | number;
  comparison?: string;
  icon: React.ReactNode;
  trend?: number;
  prefix?: string;
  suffix?: string;
}

const KpiCard = ({ 
  label, 
  value, 
  comparison, 
  icon, 
  trend = 0,
  prefix = "",
  suffix = ""
}: KpiCardProps) => {
  const trendColor = trend >= 0 ? "text-[#36B37E]" : "text-[#FF5630]";
  const trendIcon = trend >= 0 ? "+" : "";
  
  return (
    <motion.div 
      className="bg-white rounded-xl p-5 shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow"
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[#6B778C] text-sm font-medium">{label}</p>
          <h3 className="text-2xl font-display font-bold mt-1">
            {prefix}{value}{suffix}
          </h3>
          {comparison && (
            <div className="flex items-center mt-2">
              <span className={`${trendColor} text-xs font-medium`}>{trendIcon}{trend}%</span>
              <span className="text-[#6B778C] text-xs ml-1">{comparison}</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default KpiCard;
