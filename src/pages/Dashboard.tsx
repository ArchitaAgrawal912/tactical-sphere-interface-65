import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import HexGrid from "@/components/dashboard/HexGrid";
import VitalsPanel from "@/components/dashboard/VitalsPanel";
import LiveStreamPanel from "@/components/dashboard/LiveStreamPanel";
import CommsPanel from "@/components/dashboard/CommsPanel";
import MetricsPanel from "@/components/dashboard/MetricsPanel";
import ResponseProtocolPanel from "@/components/dashboard/ResponseProtocolPanel";
import Scanlines from "@/components/Scanlines";
import { AlertTriangle, Shield, Users, Bell, Play, Pause, RotateCcw, Eye, EyeOff } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { useWorkerSim } from "@/hooks/useWorkerSim";

const Dashboard = () => {
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
    // If there's a critical/high incident without an active protocol, activate it
    const unhandledIncident = incidents.find(i => !i.resolved && (i.severity === "critical" || i.severity === "high"));
    if (unhandledIncident && !activeProtocol) {
      activateProtocol(unhandledIncident);
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
        className={`fixed top-0 left-0 right-0 z-50 glass-panel border-b px-6 py-3 transition-colors ${
          isGlitching ? 'border-danger/50' : 'border-cyan/20'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className={`w-6 h-6 ${isGlitching ? 'text-danger' : 'text-cyan'}`} />
              <span className={`font-orbitron font-bold tracking-wider ${isGlitching ? 'text-danger' : 'text-cyan'}`}>
                GUARDIAN VISION
              </span>
            </div>
            <div className="h-4 w-px bg-cyan/30" />
            <span className="hud-label">Industrial Safety Command Center</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Simulation controls */}
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`hud-button flex items-center gap-2 px-3 py-1 rounded border transition-all ${
                isRunning 
                  ? 'bg-cyan/10 border-cyan/30 text-cyan hover:bg-cyan/20 hover:border-cyan hover:shadow-[0_0_10px_rgba(0,242,255,0.3)]' 
                  : 'bg-ember/10 border-ember/30 text-ember hover:bg-ember/20 hover:border-ember hover:shadow-[0_0_10px_rgba(255,191,0,0.3)]'
              } active:scale-95`}
            >
              {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span className="text-xs font-mono">{isRunning ? 'PAUSE' : 'RESUME'}</span>
            </button>

            {/* Recenter button */}
            <button
              onClick={recenterMap}
              className="hud-button flex items-center gap-2 px-3 py-1 rounded border border-cyan/30 text-cyan bg-cyan/10 hover:bg-cyan/20 hover:border-cyan hover:shadow-[0_0_10px_rgba(0,242,255,0.3)] transition-all active:scale-95"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="text-xs font-mono">RECENTER</span>
            </button>

            {/* Stats pills */}
            <div className="flex items-center gap-3">
              {/* Workers visibility toggle */}
              <button
                onClick={toggleWorkersVisibility}
                className={`hud-button flex items-center gap-2 px-3 py-1 rounded border transition-all active:scale-95 ${
                  showWorkers
                    ? 'bg-cyan/10 border-cyan/30 text-cyan hover:bg-cyan/20 hover:border-cyan hover:shadow-[0_0_10px_rgba(0,242,255,0.3)]'
                    : 'bg-muted/10 border-muted/30 text-muted-foreground hover:border-muted hover:bg-muted/20'
                }`}
              >
                {showWorkers ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <Users className="w-3 h-3" />
                <span className="text-xs font-mono">{workers.length} ACTIVE</span>
              </button>
              
              {/* Alerts badge - clickable */}
              <motion.button
                onClick={handleAlertsClick}
                className={`hud-button flex items-center gap-2 px-3 py-1 rounded border transition-all active:scale-95 ${
                  activeAlerts > 0 
                    ? 'bg-ember/10 border-ember/30 hover:bg-ember/20 hover:border-ember hover:shadow-[0_0_10px_rgba(255,191,0,0.3)]' 
                    : 'bg-muted/10 border-muted/30 hover:bg-muted/20'
                }`}
                animate={activeAlerts > 0 ? { opacity: [1, 0.7, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <AlertTriangle className={`w-3 h-3 ${activeAlerts > 0 ? 'text-ember' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-mono ${activeAlerts > 0 ? 'text-ember' : 'text-muted-foreground'}`}>
                  {activeAlerts} ALERTS
                </span>
              </motion.button>
            </div>

            <div className="h-4 w-px bg-cyan/30" />

            {/* Notifications */}
            <button 
              onClick={handleAlertsClick}
              className="hud-button relative p-2 hover:bg-cyan/10 rounded transition-all hover:shadow-[0_0_10px_rgba(0,242,255,0.3)] active:scale-95"
            >
              <Bell className="w-4 h-4 text-cyan" />
              {activeAlerts > 0 && (
                <motion.span 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-ember rounded-full text-[8px] flex items-center justify-center text-obsidian font-bold"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  {activeAlerts}
                </motion.span>
              )}
            </button>

            {/* Time display */}
            <div className="text-right">
              <p className="font-mono text-cyan text-sm">{formatTime(time)}</p>
              <p className="font-mono text-muted-foreground text-[10px]">{formatDate(time)}</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main dashboard layout */}
      <main className="pt-20 min-h-screen relative">
        {/* Corner HUD panels - z-30 to stay below header */}
        <div className="fixed top-24 left-4 z-30 hidden xl:block">
          <VitalsPanel />
        </div>

        <div className="fixed top-24 right-4 z-30 hidden xl:block">
          <LiveStreamPanel />
        </div>

        <div className="fixed bottom-4 left-4 z-30 hidden xl:block">
          <CommsPanel />
        </div>

        {/* Bottom right - Response Protocol Panel OR Metrics Panel */}
        <div className="fixed bottom-4 right-4 z-30 hidden xl:block">
          <AnimatePresence mode="wait">
            {activeProtocol ? (
              <ResponseProtocolPanel key="protocol" />
            ) : (
              <MetricsPanel key="metrics" />
            )}
          </AnimatePresence>
        </div>

        {/* Central hex grid */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
          <motion.div
            className="w-full max-w-[800px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <HexGrid />
          </motion.div>
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
