import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import HexGrid from "@/components/dashboard/HexGrid";
import VitalsPanel from "@/components/dashboard/VitalsPanel";
import LiveStreamPanel from "@/components/dashboard/LiveStreamPanel";
import CommsPanel from "@/components/dashboard/CommsPanel";
import MetricsPanel from "@/components/dashboard/MetricsPanel";
import ResponseProtocolPanel from "@/components/dashboard/ResponseProtocolPanel";
import SystemsNominalPanel from "@/components/dashboard/SystemsNominalPanel";
import Scanlines from "@/components/Scanlines";
import { AlertTriangle, Shield, Users, Bell, Play, Pause, RotateCcw, Eye, EyeOff, Cpu, Wifi, Link2 } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { useWorkerSim } from "@/hooks/useWorkerSim";
import { useBroadcastSync } from "@/hooks/useBroadcastSync";

const Dashboard = () => {
  // Enable cross-tab synchronization via BroadcastChannel API
  useBroadcastSync();
  const { 
    isGlitching, 
    workers, 
    incidents, 
    isRunning, 
    setIsRunning, 
    violationFlash,
    showWorkers,
    toggleWorkersVisibility,
    recenterMap,
    scrollToLatestAlert,
    activeProtocol,
    activateProtocol,
    isSyncActive,
    lastSyncTimestamp,
    isSiteWideEmergency,
  } = useSimulationStore();
  
  // Initialize simulation with 4-second movement, 15-second narrative
  useWorkerSim({ 
    movementInterval: 4000, 
    biometricInterval: 200,
    narrativeInterval: 15000,
    incidentInterval: 10000,
    autoStart: true 
  });

  // Time display
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => date.toLocaleTimeString("en-US", { hour12: false });
  const formatDate = (date: Date) => date.toLocaleDateString("en-US", { 
    year: "numeric", month: "2-digit", day: "2-digit" 
  }).replace(/\//g, ".");

  const activeAlerts = incidents.filter(i => !i.resolved && (i.severity === "critical" || i.severity === "high")).length;

  const handleAlertsClick = () => {
    scrollToLatestAlert();
    // Find the most recent critical/high incident
    const latestCriticalIncident = incidents.find(i => !i.resolved && (i.severity === "critical" || i.severity === "high"));
    
    if (latestCriticalIncident) {
      // Always update to the latest incident, even if protocol is open
      activateProtocol(latestCriticalIncident);
    }
  };

  return (
    <div className={`min-h-screen bg-obsidian relative overflow-hidden transition-all duration-200 ${
      isGlitching ? 'animate-[glitch_0.3s_ease-in-out]' : ''
    }`}>
      <Scanlines />

      {/* Critical alert overlay - z-40 so it doesn't block buttons */}
      {isGlitching && (
        <motion.div
          className="fixed inset-0 z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-danger/20" />
          <div className="absolute inset-0 border-4 border-danger animate-pulse" />
        </motion.div>
      )}

      {/* Violation flash overlay */}
      {violationFlash && (
        <motion.div
          className="fixed inset-0 z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.15, 0] }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-[#FF8C00]/20" />
        </motion.div>
      )}

      {/* Top header bar */}
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-50 glass-panel border-b px-4 py-2 transition-colors ${
          isGlitching ? 'border-danger/50' : 'border-cyan/20'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Shield className={`w-5 h-5 ${isGlitching ? 'text-danger' : 'text-cyan'}`} />
              <span className={`font-orbitron font-bold text-sm tracking-wider ${isGlitching ? 'text-danger' : 'text-cyan'}`}>
                GUARDIAN VISION
              </span>
            </div>
            <div className="h-4 w-px bg-cyan/30 hidden sm:block" />
            {/* AI Status Indicator */}
            <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded border border-cyan/20 bg-cyan/5">
              <motion.div
                className="flex items-center gap-1"
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Cpu className="w-3 h-3 text-cyan" />
                <span className="text-[9px] font-mono text-cyan">AI: ONLINE</span>
              </motion.div>
              <div className="h-3 w-px bg-cyan/30" />
              <div className="flex items-center gap-1">
                <motion.div
                  className="w-1.5 h-1.5 bg-cyan rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <Wifi className="w-3 h-3 text-cyan/70" />
                <span className="text-[9px] font-mono text-muted-foreground">SIGNAL: STABLE</span>
              </div>
            </div>
            
            {/* Site Centre Sync Status Indicator */}
            <motion.div 
              className={`hidden lg:flex items-center gap-1.5 px-2 py-1 rounded border transition-all ${
                isSyncActive 
                  ? 'border-cyan/30 bg-cyan/5'
                  : 'border-danger/30 bg-danger/5'
              }`}
              animate={isSiteWideEmergency ? { 
                borderColor: ['rgba(255,0,0,0.3)', 'rgba(255,0,0,0.8)', 'rgba(255,0,0,0.3)'],
                backgroundColor: ['rgba(255,0,0,0.05)', 'rgba(255,0,0,0.15)', 'rgba(255,0,0,0.05)'],
              } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <motion.div
                className={`w-1.5 h-1.5 rounded-full ${isSyncActive ? 'bg-cyan' : 'bg-danger'}`}
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <Link2 className={`w-3 h-3 ${isSyncActive ? 'text-cyan/70' : 'text-danger/70'}`} />
              <span className={`text-[9px] font-mono ${isSyncActive ? 'text-cyan' : 'text-danger'}`}>
                {isSiteWideEmergency ? 'EMERGENCY SYNC' : isSyncActive ? 'SYNCED' : 'OFFLINE'}
              </span>
            </motion.div>
          </div>

          <div className="flex items-center gap-3">
            {/* Simulation controls */}
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`hud-button flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all ${
                isRunning 
                  ? 'bg-cyan/10 border-cyan/30 text-cyan hover:bg-cyan/20 hover:border-cyan hover:shadow-[0_0_10px_rgba(0,242,255,0.3)]' 
                  : 'bg-ember/10 border-ember/30 text-ember hover:bg-ember/20 hover:border-ember hover:shadow-[0_0_10px_rgba(255,191,0,0.3)]'
              } active:scale-95`}
            >
              {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span className="text-[10px] font-mono hidden sm:inline">{isRunning ? 'PAUSE' : 'RESUME'}</span>
            </button>

            {/* Recenter button */}
            <button
              onClick={recenterMap}
              className="hud-button flex items-center gap-1.5 px-2.5 py-1 rounded border border-cyan/30 text-cyan bg-cyan/10 hover:bg-cyan/20 hover:border-cyan hover:shadow-[0_0_10px_rgba(0,242,255,0.3)] transition-all active:scale-95"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="text-[10px] font-mono hidden sm:inline">RECENTER</span>
            </button>

            {/* Stats pills */}
            <div className="flex items-center gap-2">
              {/* Workers visibility toggle */}
              <button
                onClick={toggleWorkersVisibility}
                className={`hud-button flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all active:scale-95 ${
                  showWorkers
                    ? 'bg-cyan/10 border-cyan/30 text-cyan hover:bg-cyan/20 hover:border-cyan hover:shadow-[0_0_10px_rgba(0,242,255,0.3)]'
                    : 'bg-muted/10 border-muted/30 text-muted-foreground hover:border-muted hover:bg-muted/20'
                }`}
              >
                {showWorkers ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <Users className="w-3 h-3" />
                <span className="text-[10px] font-mono hidden sm:inline">{workers.length}</span>
              </button>
              
              {/* Alerts badge - clickable */}
              <motion.button
                onClick={handleAlertsClick}
                className={`hud-button flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all active:scale-95 ${
                  activeAlerts > 0 
                    ? 'bg-ember/10 border-ember/30 hover:bg-ember/20 hover:border-ember hover:shadow-[0_0_10px_rgba(255,191,0,0.3)]' 
                    : 'bg-muted/10 border-muted/30 hover:bg-muted/20'
                }`}
                animate={activeAlerts > 0 ? { opacity: [1, 0.7, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <AlertTriangle className={`w-3 h-3 ${activeAlerts > 0 ? 'text-ember' : 'text-muted-foreground'}`} />
                <span className={`text-[10px] font-mono ${activeAlerts > 0 ? 'text-ember' : 'text-muted-foreground'}`}>
                  {activeAlerts}
                </span>
              </motion.button>
            </div>

            <div className="h-4 w-px bg-cyan/30 hidden sm:block" />

            {/* Notifications */}
            <button 
              onClick={handleAlertsClick}
              className="hud-button relative p-1.5 hover:bg-cyan/10 rounded transition-all hover:shadow-[0_0_10px_rgba(0,242,255,0.3)] active:scale-95"
            >
              <Bell className="w-4 h-4 text-cyan" />
              {activeAlerts > 0 && (
                <motion.span 
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-ember rounded-full text-[7px] flex items-center justify-center text-obsidian font-bold"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  {activeAlerts}
                </motion.span>
              )}
            </button>

            {/* Time display */}
            <div className="text-right hidden md:block">
              <p className="font-mono text-cyan text-xs">{formatTime(time)}</p>
              <p className="font-mono text-muted-foreground text-[9px]">{formatDate(time)}</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main dashboard layout - True Bento Grid with viewport-constrained panels */}
      <main className="pt-14 h-screen overflow-hidden relative">
        {/* Desktop Command-Wing Layout - Fixed 350px side columns */}
        <div className="hidden xl:grid xl:grid-cols-[350px_1fr_350px] gap-4 p-4 h-[calc(100vh-56px)]">
          {/* Left Wing (Panel A) - Elastic Vitals (30%) and Expanded AI Log (70%) */}
          <div className="flex flex-col gap-3 h-full min-w-0 overflow-hidden">
            {/* Vitals - elastic scroll, max 32% height */}
            <div className="shrink-0 max-h-[32vh] min-h-[180px] overflow-hidden">
              <VitalsPanel />
            </div>
            {/* AI Detection Log - expanded to fill remaining ~68% */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <CommsPanel />
            </div>
          </div>

          {/* Center Stage - Tactical Sphere (lower z-index, draggable/zoomable) */}
          <div className="flex items-center justify-center relative z-0 min-w-0">
            <motion.div
              className="w-full max-w-[600px] aspect-square"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <HexGrid />
            </motion.div>
          </div>

          {/* Right Wing (Panel B) - Live Feed (top) and PPE/Protocol stack (bottom) */}
          <div className="flex flex-col gap-4 h-full min-w-0 overflow-hidden">
            <div className="shrink-0">
              <LiveStreamPanel />
            </div>
            {/* Protocol/Nominal + Metrics - scrollable container */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin pb-4">
              <div className="space-y-4">
                {/* Protocol Panel - Manual trigger only */}
                <AnimatePresence mode="wait">
                  {activeProtocol ? (
                    <ResponseProtocolPanel key="protocol" />
                  ) : (
                    <SystemsNominalPanel key="nominal" />
                  )}
                </AnimatePresence>
                {/* PPE Metrics - always visible */}
                <MetricsPanel />
              </div>
            </div>
          </div>
        </div>

        {/* Tablet/Large screen layout - Fixed 300px side columns */}
        <div className="hidden lg:grid xl:hidden lg:grid-cols-[300px_1fr_300px] gap-4 p-4 h-[calc(100vh-56px)]">
          {/* Left column - Elastic Vitals (32%) and Expanded Log (68%) */}
          <div className="flex flex-col gap-3 h-full min-w-0 overflow-hidden">
            <div className="shrink-0 max-h-[32vh] min-h-[180px] overflow-hidden">
              <VitalsPanel />
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <CommsPanel />
            </div>
          </div>

          {/* Center - Tactical Grid */}
          <div className="flex items-center justify-center relative z-0 min-w-0">
            <motion.div
              className="w-full max-w-[480px] aspect-square"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <HexGrid />
            </motion.div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4 h-full min-w-0 overflow-hidden">
            <div className="shrink-0">
              <LiveStreamPanel />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin pb-4">
              <div className="space-y-4">
                <AnimatePresence mode="wait">
                  {activeProtocol ? (
                    <ResponseProtocolPanel key="protocol" />
                  ) : (
                    <SystemsNominalPanel key="nominal" />
                  )}
                </AnimatePresence>
                <MetricsPanel />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile/Small screen layout */}
        <div className="lg:hidden flex flex-col gap-4 p-4 pb-8">
          {/* Tactical Grid centered */}
          <div className="flex items-center justify-center relative z-0">
            <motion.div
              className="w-full max-w-[360px] aspect-square"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <HexGrid />
            </motion.div>
          </div>

          {/* Scrollable panels below */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <VitalsPanel />
            <LiveStreamPanel />
            <CommsPanel />
            <AnimatePresence mode="wait">
              {activeProtocol ? (
                <ResponseProtocolPanel key="protocol" />
              ) : (
                <SystemsNominalPanel key="nominal" />
              )}
            </AnimatePresence>
            <MetricsPanel />
          </div>
        </div>

        {/* Ambient grid background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className={`absolute inset-0 transition-colors duration-300 ${
            isGlitching 
              ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.05)_0%,transparent_50%)]'
              : 'bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.03)_0%,transparent_50%)]'
          }`} />
          <svg className="absolute inset-0 w-full h-full opacity-5">
            <pattern id="bgGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#bgGrid)" />
          </svg>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
