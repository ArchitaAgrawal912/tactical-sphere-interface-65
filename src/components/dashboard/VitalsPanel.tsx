import { motion } from "framer-motion";
import { Activity, Cpu, Thermometer, Wifi } from "lucide-react";
import { useEffect, useState } from "react";

const VitalsPanel = () => {
  const [uptime, setUptime] = useState("847:23:45");
  const [temp, setTemp] = useState(42);

  useEffect(() => {
    const interval = setInterval(() => {
      setTemp(prev => Math.max(38, Math.min(55, prev + (Math.random() - 0.5) * 2)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="glass-panel clip-corner-tl p-4 w-72"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-cyan" />
        <span className="hud-label">System Vitals</span>
      </div>

      <div className="space-y-4">
        {/* Uptime */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">UPTIME</span>
          </div>
          <span className="text-cyan font-mono text-sm">{uptime}</span>
        </div>

        {/* AI Core Temp */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Thermometer className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground">AI CORE TEMP</span>
            </div>
            <span className={`font-mono text-sm ${temp > 50 ? 'text-ember' : 'text-cyan'}`}>
              {temp.toFixed(1)}°C
            </span>
          </div>
          <div className="h-1.5 bg-obsidian-light rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${temp > 50 ? 'bg-ember' : 'bg-cyan'}`}
              animate={{ width: `${(temp / 60) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Network Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-3 h-3 text-cyan" />
            <span className="text-xs font-mono text-muted-foreground">NETWORK</span>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-cyan rounded-full"
                animate={{ height: [4, 8, 12, 16][i] + Math.random() * 4 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              />
            ))}
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex gap-2 pt-2 border-t border-cyan/10">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-cyan rounded-full animate-pulse" />
            <span className="text-[10px] font-mono text-cyan">ONLINE</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-ember rounded-full" />
            <span className="text-[10px] font-mono text-muted-foreground">3 ALERTS</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VitalsPanel;
