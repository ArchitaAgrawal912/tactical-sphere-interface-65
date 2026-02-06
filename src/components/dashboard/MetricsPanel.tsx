import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, HardHat, Glasses, AlertTriangle, User } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";

const CircularProgress = ({ 
  value, 
  max, 
  color, 
  size = 70,
  isHighlighted = false,
  onClick,
}: { 
  value: number; 
  max: number; 
  color: string; 
  size?: number;
  isHighlighted?: boolean;
  onClick?: () => void;
}) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / max) * circumference;

  const colorClass = color === "cyan" ? "text-cyan" : color === "ember" ? "text-ember" : "text-danger";
  const glowColor = color === "cyan" ? "rgba(0,242,255,0.5)" : color === "ember" ? "rgba(255,191,0,0.5)" : "rgba(255,0,0,0.5)";

  return (
    <svg 
      width={size} 
      height={size} 
      className={`transform -rotate-90 cursor-pointer transition-transform hover:scale-110 active:scale-95 ${isHighlighted ? 'scale-110' : ''}`}
      onClick={onClick}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        className="text-obsidian-light"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        className={colorClass}
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ 
          strokeDashoffset,
          filter: isHighlighted ? `drop-shadow(0 0 12px ${glowColor})` : `drop-shadow(0 0 6px ${glowColor})`,
        }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      {isHighlighted && (
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius + 4}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className={colorClass}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </svg>
  );
};

const MetricsPanel = () => {
  const { workers, incidents, highlightedPPEType, setHighlightedPPEType, focusedWorkerId } = useSimulationStore();

  // Get focused worker or use global averages
  const focusedWorker = workers.find(w => w.id === focusedWorkerId);
  const isShowingWorker = !!focusedWorker;

  // Calculate PPE metrics from workers (global) or focused worker
  const avgPPE = focusedWorker 
    ? focusedWorker.ppe 
    : Math.round(workers.reduce((acc, w) => acc + w.ppe, 0) / workers.length);
  
  // Simulate different PPE types based on worker's PPE score
  const helmetCompliance = focusedWorker 
    ? (focusedWorker.ppe >= 90 ? 100 : focusedWorker.ppe >= 70 ? 85 : 60)
    : Math.min(100, avgPPE + 5);
  const vestCompliance = focusedWorker
    ? (focusedWorker.ppe >= 80 ? 100 : focusedWorker.ppe >= 60 ? 75 : 50)
    : Math.max(60, avgPPE - 5);
  const eyewearCompliance = focusedWorker
    ? (focusedWorker.ppe >= 70 ? 100 : focusedWorker.ppe >= 50 ? 70 : 40)
    : Math.max(50, avgPPE - 15);

  const metrics = [
    { 
      label: "Helmets", 
      type: "helmet",
      value: helmetCompliance, 
      max: 100, 
      color: helmetCompliance >= 90 ? "cyan" : helmetCompliance >= 70 ? "ember" : "danger",
      icon: <HardHat className="w-3 h-3" /> 
    },
    { 
      label: "Vests", 
      type: "vest",
      value: vestCompliance, 
      max: 100, 
      color: vestCompliance >= 90 ? "cyan" : vestCompliance >= 70 ? "ember" : "danger",
      icon: <ShieldCheck className="w-3 h-3" /> 
    },
    { 
      label: "Eyewear", 
      type: "eyewear",
      value: eyewearCompliance, 
      max: 100, 
      color: eyewearCompliance >= 90 ? "cyan" : eyewearCompliance >= 70 ? "ember" : "danger",
      icon: <Glasses className="w-3 h-3" /> 
    },
  ];

  const overallCompliance = Math.round((helmetCompliance + vestCompliance + eyewearCompliance) / 3);
  const activeViolations = incidents.filter(i => !i.resolved && i.type === "ppe_violation").length;
  const safeWorkers = workers.filter(w => w.status === "safe").length;

  const handleMetricClick = (type: string) => {
    setHighlightedPPEType(type);
  };

  return (
    <motion.div
      className="p-4 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">PPE Compliance</span>
        {highlightedPPEType && (
          <motion.span 
            className="ml-auto text-[9px] font-mono text-ember uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            Filtering: {highlightedPPEType}
          </motion.span>
        )}
      </div>

      {/* Selected Worker Header */}
      <AnimatePresence mode="wait">
        {isShowingWorker ? (
          <motion.div
            key="worker-header"
            className="mb-3 px-2 py-1.5 bg-cyan/10 border border-cyan/30 rounded flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <User className="w-3 h-3 text-cyan" />
            <span className="text-xs font-mono text-cyan font-bold">SELECTED: {focusedWorker?.id}</span>
          </motion.div>
        ) : (
          <motion.div
            key="global-header"
            className="mb-3 px-2 py-1.5 bg-obsidian-light/50 border border-cyan/10 rounded flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span className="text-xs font-mono text-muted-foreground">GLOBAL AVERAGES</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Circular metrics - clickable */}
      <div className="flex justify-around mb-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex flex-col items-center">
            <div className="relative">
              <CircularProgress 
                value={metric.value} 
                max={metric.max} 
                color={metric.color}
                isHighlighted={highlightedPPEType === metric.type}
                onClick={() => handleMetricClick(metric.type)}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className={`text-sm font-orbitron font-bold ${
                  metric.color === "cyan" ? "text-cyan" : 
                  metric.color === "ember" ? "text-ember" : "text-danger"
                }`}>
                  {metric.value}%
                </span>
              </div>
            </div>
            <button
              onClick={() => handleMetricClick(metric.type)}
              className={`flex items-center gap-1 mt-2 px-2 py-0.5 rounded transition-all hover:bg-cyan/10 active:scale-95 ${
                highlightedPPEType === metric.type ? 'bg-cyan/20 border border-cyan/30' : ''
              }`}
            >
              <span className={
                metric.color === "cyan" ? "text-cyan" : 
                metric.color === "ember" ? "text-ember" : "text-danger"
              }>{metric.icon}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{metric.label}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Overall compliance bar */}
      <div className="mt-4 pt-4 border-t border-cyan/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-muted-foreground">OVERALL</span>
          <span className={`font-orbitron font-bold text-sm ${
            overallCompliance >= 90 ? 'text-cyan' : overallCompliance >= 70 ? 'text-ember' : 'text-danger'
          }`}>{overallCompliance}%</span>
        </div>
        <div className="h-2 bg-obsidian-light rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${
              overallCompliance >= 90 
                ? 'bg-gradient-to-r from-cyan to-cyan-glow' 
                : overallCompliance >= 70 
                ? 'bg-gradient-to-r from-ember to-ember-glow'
                : 'bg-gradient-to-r from-danger to-danger-glow'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${overallCompliance}%` }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="bg-obsidian/50 rounded p-2 border border-cyan/10">
          <p className="text-[10px] font-mono text-muted-foreground">WORKERS</p>
          <p className="text-cyan font-orbitron font-bold">{safeWorkers}/{workers.length}</p>
        </div>
        <motion.div 
          className="bg-obsidian/50 rounded p-2 border border-ember/10"
          animate={activeViolations > 0 ? { borderColor: ["rgba(255,191,0,0.1)", "rgba(255,191,0,0.5)", "rgba(255,191,0,0.1)"] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-ember" />
            <p className="text-[10px] font-mono text-muted-foreground">VIOLATIONS</p>
          </div>
          <p className="text-ember font-orbitron font-bold">{activeViolations}</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MetricsPanel;
