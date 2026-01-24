import { motion } from "framer-motion";

interface HeartRateSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
}

const HeartRateSparkline = ({ 
  data, 
  width = 120, 
  height = 32,
  strokeColor = "currentColor"
}: HeartRateSparklineProps) => {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Generate SVG path
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - min) / range) * chartHeight;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;

  // Create gradient fill path (closed)
  const fillPathD = `${pathD} L ${padding + chartWidth},${height} L ${padding},${height} Z`;

  return (
    <div className="relative" style={{ width, height }}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Gradient fill under the line */}
        <defs>
          <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Fill area */}
        <motion.path
          d={fillPathD}
          fill="url(#sparklineGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        
        {/* Current value dot */}
        <motion.circle
          cx={padding + chartWidth}
          cy={padding + chartHeight - ((data[data.length - 1] - min) / range) * chartHeight}
          r="3"
          fill={strokeColor}
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      </svg>
    </div>
  );
};

export default HeartRateSparkline;
