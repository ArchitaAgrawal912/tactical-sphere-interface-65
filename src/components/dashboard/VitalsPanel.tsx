import { motion, AnimatePresence } from "framer-motion";
import { Activity, Cpu, Thermometer, Wifi, Heart, Wind, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import HeartRateSparkline from "./HeartRateSparkline";

const VitalsPanel = () => {
  const { workers, isRunning, focusedWorkerId } = useSimulationStore();
  const [uptime, setUptime] = useState(847 * 3600 + 23 * 60 + 45);
  const [temp, setTemp] = useState(42);

  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(prev => prev + 1);
      setTemp(prev => Math.max(38, Math.min(55, prev + (Math.random() - 0.5) * 2)));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Get focused worker or calculate global averages
  const focusedWorker = workers.find(w => w.id === focusedWorkerId);
  const isShowingWorker = !!focusedWorker;

  // Calculate average vitals from workers (for global view)
  const avgHeartRate = focusedWorker 
    ? focusedWorker.heartRate 
    : Math.round(workers.reduce((acc, w) => acc + w.heartRate, 0) / workers.length);
  
  const avgOxygen = focusedWorker
    ? focusedWorker.oxygenLevel.toFixed(1)
    : (workers.reduce((acc, w) => acc + w.oxygenLevel, 0) / workers.length).toFixed(1);

  // Get HR sparkline color based on status
  const getSparklineColor = () => {
    if (!focusedWorker) return "rgb(0, 242, 255)"; // cyan
    if (focusedWorker.status === "danger" || focusedWorker.heartRate > 125) {
      return "rgb(255, 0, 0)"; // danger
    }
    if (focusedWorker.hrElevated || focusedWorker.status === "warning") {
      return "rgb(255, 191, 0)"; // ember
    }
    return "rgb(0, 242, 255)"; // cyan
  };

  return (
    <motion.div
      className="glass-panel clip-corner-tl p-3 w-full"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan" />
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan">System Vitals</span>
        </div>
        <div className="flex items-center gap-1">
          <motion.div 
            className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-cyan' : 'bg-ember'}`}
            animate={isRunning ? { opacity: [1, 0.3, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className={`text-[9px] font-mono ${isRunning ? 'text-cyan' : 'text-ember'}`}>
            {isRunning ? 'ONLINE' : 'PAUSED'}
          </span>
        </div>
      </div>

      {/* Selected Worker Badge - compact */}
      <AnimatePresence mode="wait">
        {isShowingWorker ? (
          <motion.div
            key="worker-header"
            className="mb-2 px-2 py-1 bg-cyan/10 border border-cyan/30 rounded flex items-center gap-2"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <User className="w-3 h-3 text-cyan" />
            <span className="text-[10px] font-mono text-cyan font-bold">{focusedWorker.id}</span>
            <span className="text-[9px] font-mono text-muted-foreground ml-1">{focusedWorker.name}</span>
            <motion.div
              className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="global-header"
            className="mb-2 px-2 py-1 bg-obsidian-light/50 border border-cyan/10 rounded"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <span className="text-[9px] font-mono text-muted-foreground">GLOBAL AVERAGES • {workers.length} TRACKED</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact 2x2 Grid for Core Stats */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {/* AI Core Temp */}
        <div className="bg-obsidian/50 rounded p-1.5 border border-cyan/10">
          <div className="flex items-center gap-1 mb-1">
            <Thermometer className="w-2.5 h-2.5 text-muted-foreground" />
            <span className="text-[8px] font-mono text-muted-foreground">AI CORE</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`font-mono text-xs font-bold ${temp > 50 ? 'text-ember' : 'text-cyan'}`}>
              {temp.toFixed(0)}°C
            </span>
            <div className="w-12 h-1 bg-obsidian-light rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${temp > 50 ? 'bg-ember' : 'bg-cyan'}`}
                animate={{ width: `${(temp / 60) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Network Status */}
        <div className="bg-obsidian/50 rounded p-1.5 border border-cyan/10">
          <div className="flex items-center gap-1 mb-1">
            <Wifi className="w-2.5 h-2.5 text-cyan" />
            <span className="text-[8px] font-mono text-muted-foreground">NETWORK</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-cyan">STABLE</span>
            <div className="flex items-center gap-0.5">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-0.5 bg-cyan rounded-full"
                  animate={{ height: [3, 6, 9, 12][i] + Math.random() * 2 }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-obsidian/50 rounded p-1.5 border border-cyan/10">
          <div className="flex items-center gap-1 mb-1">
            <Cpu className="w-2.5 h-2.5 text-muted-foreground" />
            <span className="text-[8px] font-mono text-muted-foreground">UPTIME</span>
          </div>
          <span className="text-cyan font-mono text-xs font-bold">{formatUptime(uptime)}</span>
        </div>

        {/* O2 Level */}
        <div className="bg-obsidian/50 rounded p-1.5 border border-cyan/10">
          <div className="flex items-center gap-1 mb-1">
            <Wind className="w-2.5 h-2.5 text-muted-foreground" />
            <span className="text-[8px] font-mono text-muted-foreground">
              {isShowingWorker ? 'O2 LVL' : 'AVG O2'}
            </span>
          </div>
          <span className={`font-mono text-xs font-bold ${parseFloat(avgOxygen) < 94 ? 'text-ember' : 'text-cyan'}`}>
            {avgOxygen}%
          </span>
        </div>
      </div>

      {/* Heart Rate with Sparkline - Full Width */}
      <div className="bg-obsidian/50 rounded p-2 border border-cyan/10">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <motion.div
              className="w-2 h-2 bg-danger rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <span className="text-[9px] font-mono text-muted-foreground">
              {isShowingWorker ? 'HEART RATE' : 'AVG HR'}
            </span>
          </div>
          <span className={`font-mono text-sm font-bold ${avgHeartRate > 100 ? 'text-ember' : 'text-cyan'}`}>
            {avgHeartRate} BPM
          </span>
        </div>
        
        {/* HR Sparkline - always show (worker-specific or placeholder) */}
        <div className="h-8">
          {isShowingWorker && focusedWorker ? (
            <HeartRateSparkline 
              data={focusedWorker.hrHistory} 
              strokeColor={getSparklineColor()}
              width={280}
              height={32}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[8px] font-mono text-muted-foreground/50">SELECT WORKER FOR HR HISTORY</span>
            </div>
          )}
        </div>
      </div>

      {/* Worker-specific PPE score - compact inline */}
      <AnimatePresence>
        {isShowingWorker && focusedWorker && (
          <motion.div 
            className="mt-2 flex items-center justify-between px-2 py-1 bg-obsidian/50 rounded border border-cyan/10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <span className="text-[9px] font-mono text-muted-foreground">PPE COMPLIANCE</span>
            <span className={`font-mono text-xs font-bold ${
              focusedWorker.ppe >= 90 ? 'text-cyan' : 
              focusedWorker.ppe >= 70 ? 'text-ember' : 'text-danger'
            }`}>
              {focusedWorker.ppe}%
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VitalsPanel;
