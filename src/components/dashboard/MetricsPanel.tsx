import { motion } from "framer-motion";
import { ShieldCheck, HardHat, Glasses } from "lucide-react";

interface MetricRing {
  label: string;
  value: number;
  max: number;
  color: "cyan" | "ember" | "danger";
  icon: React.ReactNode;
}

const metrics: MetricRing[] = [
  { label: "Helmets", value: 94, max: 100, color: "cyan", icon: <HardHat className="w-3 h-3" /> },
  { label: "Vests", value: 87, max: 100, color: "cyan", icon: <ShieldCheck className="w-3 h-3" /> },
  { label: "Eyewear", value: 72, max: 100, color: "ember", icon: <Glasses className="w-3 h-3" /> },
];

const CircularProgress = ({ value, max, color, size = 70 }: { value: number; max: number; color: string; size?: number }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / max) * circumference;

  const colorClass = color === "cyan" ? "text-cyan" : color === "ember" ? "text-ember" : "text-danger";
  const glowColor = color === "cyan" ? "rgba(0,242,255,0.5)" : color === "ember" ? "rgba(255,191,0,0.5)" : "rgba(255,0,0,0.5)";

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        className="text-obsidian-light"
      />
      {/* Progress circle */}
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
        animate={{ strokeDashoffset }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
      />
    </svg>
  );
};

const MetricsPanel = () => {
  return (
    <motion.div
      className="glass-panel clip-corner-br p-4 w-72"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-4 h-4 text-cyan" />
        <span className="hud-label">PPE Compliance</span>
      </div>

      {/* Circular metrics */}
      <div className="flex justify-around mb-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex flex-col items-center">
            <div className="relative">
              <CircularProgress value={metric.value} max={metric.max} color={metric.color} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-sm font-orbitron font-bold ${
                  metric.color === "cyan" ? "text-cyan" : 
                  metric.color === "ember" ? "text-ember" : "text-danger"
                }`}>
                  {metric.value}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className={
                metric.color === "cyan" ? "text-cyan" : 
                metric.color === "ember" ? "text-ember" : "text-danger"
              }>{metric.icon}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{metric.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Overall compliance bar */}
      <div className="mt-4 pt-4 border-t border-cyan/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-muted-foreground">OVERALL COMPLIANCE</span>
          <span className="text-cyan font-orbitron font-bold text-sm">84%</span>
        </div>
        <div className="h-2 bg-obsidian-light rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan to-cyan-glow"
            initial={{ width: 0 }}
            animate={{ width: "84%" }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="bg-obsidian/50 rounded p-2 border border-cyan/10">
          <p className="text-[10px] font-mono text-muted-foreground">WORKERS</p>
          <p className="text-cyan font-orbitron font-bold">24/28</p>
        </div>
        <div className="bg-obsidian/50 rounded p-2 border border-ember/10">
          <p className="text-[10px] font-mono text-muted-foreground">VIOLATIONS</p>
          <p className="text-ember font-orbitron font-bold">3</p>
        </div>
      </div>
    </motion.div>
  );
};

export default MetricsPanel;
