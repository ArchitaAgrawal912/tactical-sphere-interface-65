import { motion, AnimatePresence } from "framer-motion";
import { Activity, Cpu, Thermometer, Wifi, Heart, Wind, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import HeartRateSparkline from "./HeartRateSparkline";
import WorkerStatusBadge from "./WorkerStatusBadge";

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
      className="glass-panel clip-corner-tl p-4 w-72"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-cyan" />
        <span className="hud-label">System Vitals</span>
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
            <span className="text-xs font-mono text-cyan font-bold">SELECTED: {focusedWorker.id}</span>
            <motion.div
              className="ml-auto w-2 h-2 rounded-full bg-cyan"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
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

      {/* Worker Status Badge - shown when worker is selected */}
      <AnimatePresence>
        {isShowingWorker && focusedWorker && (
          <motion.div
            className="mb-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <WorkerStatusBadge worker={focusedWorker} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {/* Uptime */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">UPTIME</span>
          </div>
          <span className="text-cyan font-mono text-sm">{formatUptime(uptime)}</span>
        </div>

        {/* AI Core Temp */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Thermometer className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground">AI CORE</span>
            </div>
            <span className={`font-mono text-sm ${temp > 50 ? 'text-ember' : 'text-cyan'}`}>
              {temp.toFixed(1)}°C
            </span>
          </div>
          <div className="h-1.5 bg-obsidian-light rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${temp > 50 ? 'bg-gradient-to-r from-ember to-danger' : 'bg-gradient-to-r from-cyan to-cyan-glow'}`}
              animate={{ width: `${(temp / 60) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Heart Rate - shows selected worker or global avg */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">
              {isShowingWorker ? 'HEART RATE' : 'AVG HR'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 bg-danger rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <span className={`font-mono text-sm ${avgHeartRate > 100 ? 'text-ember' : 'text-cyan'}`}>
              {avgHeartRate} BPM
            </span>
          </div>
        </div>

        {/* HR Sparkline - shown when worker is selected */}
        <AnimatePresence>
          {isShowingWorker && focusedWorker && (
            <motion.div
              className="bg-obsidian/50 rounded p-2 border border-cyan/10"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono text-muted-foreground">HR HISTORY (60s)</span>
                <span className={`text-[10px] font-mono ${
                  focusedWorker.heartRate > 100 ? 'text-ember' : 'text-cyan'
                }`}>
                  {focusedWorker.heartRate} BPM
                </span>
              </div>
              <HeartRateSparkline 
                data={focusedWorker.hrHistory} 
                strokeColor={getSparklineColor()}
                width={240}
                height={40}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Oxygen Level - shows selected worker or global avg */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wind className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">
              {isShowingWorker ? 'O2 LEVEL' : 'AVG O2'}
            </span>
          </div>
          <span className={`font-mono text-sm ${parseFloat(avgOxygen) < 94 ? 'text-ember' : 'text-cyan'}`}>
            {avgOxygen}%
          </span>
        </div>

        {/* Worker-specific PPE score when focused */}
        <AnimatePresence>
          {isShowingWorker && focusedWorker && (
            <motion.div 
              className="flex items-center justify-between"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">PPE SCORE</span>
              </div>
              <span className={`font-mono text-sm ${
                focusedWorker.ppe >= 90 ? 'text-cyan' : 
                focusedWorker.ppe >= 70 ? 'text-ember' : 'text-danger'
              }`}>
                {focusedWorker.ppe}%
              </span>
            </motion.div>
          )}
        </AnimatePresence>

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
            <motion.div 
              className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-cyan' : 'bg-ember'}`}
              animate={isRunning ? { opacity: [1, 0.3, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className={`text-[10px] font-mono ${isRunning ? 'text-cyan' : 'text-ember'}`}>
              {isRunning ? 'ONLINE' : 'PAUSED'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-cyan rounded-full" />
            <span className="text-[10px] font-mono text-muted-foreground">
              {workers.length} TRACKED
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VitalsPanel;
