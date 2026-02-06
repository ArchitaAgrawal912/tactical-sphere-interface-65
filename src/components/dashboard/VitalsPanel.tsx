import { motion, AnimatePresence } from "framer-motion";
import { Activity, Cpu, Thermometer, Wifi, Heart, Wind, User, AlertTriangle, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import HeartRateSparkline from "./HeartRateSparkline";
import { ScrollArea } from "@/components/ui/scroll-area";
import { calculateGroupBiometrics } from "@/utils/riskDetection";

const VitalsPanel = () => {
  const { 
    workers, 
    isRunning, 
    focusedWorkerId,
    isSiteWideEmergency,
    affectedWorkerIds,
  } = useSimulationStore();
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
  const isShowingMassIncident = isSiteWideEmergency && affectedWorkerIds.length > 1 && !isShowingWorker;

  // Calculate group biometrics for mass incident
  const groupBiometrics = isShowingMassIncident 
    ? calculateGroupBiometrics(workers, affectedWorkerIds)
    : null;

  // Calculate average vitals from workers (for global view)
  const avgHeartRate = focusedWorker 
    ? focusedWorker.heartRate 
    : isShowingMassIncident && groupBiometrics
      ? groupBiometrics.avgHeartRate
      : Math.round(workers.reduce((acc, w) => acc + w.heartRate, 0) / workers.length);
  
  const avgOxygen = focusedWorker
    ? focusedWorker.oxygenLevel.toFixed(1)
    : isShowingMassIncident && groupBiometrics
      ? groupBiometrics.avgOxygen.toFixed(1)
      : (workers.reduce((acc, w) => acc + w.oxygenLevel, 0) / workers.length).toFixed(1);

  // Get HR sparkline color based on status
  const getSparklineColor = () => {
    if (isShowingMassIncident) return "rgb(255, 0, 0)"; // danger
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
      className="w-full h-full flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      {/* Header */}
      <div className="shrink-0 pb-3 mb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">System Vitals</span>
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

        {/* Selected Worker / Mass Incident Badge - sticky context */}
        <AnimatePresence mode="wait">
          {isShowingMassIncident ? (
            <motion.div
              key="mass-incident-header"
              className="px-2 py-1.5 bg-danger/20 border border-danger/50 rounded"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-danger" />
                </motion.div>
                <span className="text-[10px] font-mono text-danger font-bold">MASS INCIDENT</span>
                <div className="flex items-center gap-1 ml-auto">
                  <Users className="w-3 h-3 text-danger" />
                  <span className="text-[10px] font-mono text-danger font-bold">{affectedWorkerIds.length}</span>
                </div>
              </div>
              <p className="text-[8px] font-mono text-danger/80 mt-0.5">
                AT RISK: {affectedWorkerIds.join(", ")}
              </p>
            </motion.div>
          ) : isShowingWorker ? (
            <motion.div
              key="worker-header"
              className="px-2 py-1 bg-cyan/10 border border-cyan/30 rounded flex items-center gap-2"
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
              className="px-2 py-1 bg-obsidian-light/50 border border-cyan/10 rounded"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              <span className="text-[9px] font-mono text-muted-foreground">GLOBAL AVERAGES • {workers.length} TRACKED</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scrollable Content Area */}
      <ScrollArea className="flex-1 min-h-0 vitals-scroll-area">
        <div className="p-3 pt-2 pb-6 space-y-2">
          {/* Compact 2x2 Grid for Core Stats */}
          <div className="grid grid-cols-2 gap-2">
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
          <div className={`bg-obsidian/50 rounded p-2 border ${isShowingMassIncident ? 'border-danger/30' : 'border-cyan/10'}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <motion.div
                  className={`w-2 h-2 rounded-full ${isShowingMassIncident ? 'bg-danger' : 'bg-danger'}`}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: isShowingMassIncident ? 0.5 : 0.8, repeat: Infinity }}
                />
                <span className={`text-[9px] font-mono ${isShowingMassIncident ? 'text-danger' : 'text-muted-foreground'}`}>
                  {isShowingMassIncident ? 'GROUP AVG HR' : isShowingWorker ? 'HEART RATE' : 'AVG HR'}
                </span>
              </div>
              <span className={`font-mono text-sm font-bold ${isShowingMassIncident || avgHeartRate > 100 ? 'text-danger' : 'text-cyan'}`}>
                {avgHeartRate} BPM
              </span>
            </div>
            
            {/* Mass incident group stats */}
            {isShowingMassIncident && groupBiometrics && (
              <motion.div 
                className="grid grid-cols-2 gap-2 mb-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <div className="bg-danger/10 rounded px-1.5 py-1 border border-danger/20">
                  <span className="text-[7px] font-mono text-danger/70 block">MAX HR</span>
                  <span className="text-[10px] font-mono text-danger font-bold">{groupBiometrics.maxHR} BPM</span>
                </div>
                <div className="bg-danger/10 rounded px-1.5 py-1 border border-danger/20">
                  <span className="text-[7px] font-mono text-danger/70 block">MIN O2</span>
                  <span className="text-[10px] font-mono text-danger font-bold">{groupBiometrics.minO2}%</span>
                </div>
              </motion.div>
            )}
            
            {/* HR Sparkline - always show (worker-specific or placeholder) */}
            <div className="h-8">
              {isShowingWorker && focusedWorker ? (
                <HeartRateSparkline 
                  data={focusedWorker.hrHistory} 
                  strokeColor={getSparklineColor()}
                  width={280}
                  height={32}
                />
              ) : isShowingMassIncident ? (
                <div className="w-full h-full flex items-center justify-center bg-danger/5 rounded border border-danger/10">
                  <motion.span 
                    className="text-[8px] font-mono text-danger"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ⚠️ MONITORING {affectedWorkerIds.length} WORKERS
                  </motion.span>
                </div>
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
                className="flex items-center justify-between px-2 py-1 bg-obsidian/50 rounded border border-cyan/10"
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
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default VitalsPanel;
