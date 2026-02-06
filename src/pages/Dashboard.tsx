import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, lazy, Suspense } from "react";
import VitalsPanel from "@/components/dashboard/VitalsPanel";
import LiveStreamPanel from "@/components/dashboard/LiveStreamPanel";
import CommsPanel from "@/components/dashboard/CommsPanel";
import MetricsPanel from "@/components/dashboard/MetricsPanel";
import ResponseProtocolPanel from "@/components/dashboard/ResponseProtocolPanel";
import SystemsNominalPanel from "@/components/dashboard/SystemsNominalPanel";
import { 
  Shield, Users, AlertTriangle, Bell, Play, Pause, RotateCcw, 
  Eye, EyeOff, Cpu, Wifi, Link2, ChevronDown, BarChart3, FileText 
} from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { useWorkerSim } from "@/hooks/useWorkerSim";
import { useBroadcastSync } from "@/hooks/useBroadcastSync";
import { ScrollArea } from "@/components/ui/scroll-area";

// Lazy load the HexGrid for performance
const HexGrid = lazy(() => import("@/components/dashboard/HexGrid"));

const Dashboard = () => {
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
    isSiteWideEmergency,
  } = useSimulationStore();
  
  useWorkerSim({ 
    movementInterval: 4000, 
    biometricInterval: 200,
    narrativeInterval: 15000,
    incidentInterval: 10000,
    autoStart: true 
  });

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => date.toLocaleTimeString("en-US", { hour12: false });
  const formatDate = (date: Date) => date.toLocaleDateString("en-US", { 
    year: "numeric", month: "short", day: "numeric" 
  });

  const activeAlerts = incidents.filter(i => !i.resolved && (i.severity === "critical" || i.severity === "high")).length;
  const safeWorkers = workers.filter(w => w.status === "safe").length;
  const warningWorkers = workers.filter(w => w.status === "warning").length;

  const handleAlertsClick = () => {
    scrollToLatestAlert();
    const latestCriticalIncident = incidents.find(i => !i.resolved && (i.severity === "critical" || i.severity === "high"));
    if (latestCriticalIncident) {
      activateProtocol(latestCriticalIncident);
    }
  };

  return (
    <div className={`min-h-screen bg-background transition-all duration-200 ${
      isGlitching ? 'animate-[glitch_0.3s_ease-in-out]' : ''
    }`}>
      {/* Critical alert overlay */}
      {isGlitching && (
        <motion.div
          className="fixed inset-0 z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-destructive/20" />
          <div className="absolute inset-0 border-2 border-destructive animate-pulse" />
        </motion.div>
      )}

      {/* Violation flash overlay */}
      {violationFlash && (
        <motion.div
          className="fixed inset-0 z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-amber/10" />
        </motion.div>
      )}

      {/* Clean Professional Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="max-w-[1800px] mx-auto px-6 py-3 flex items-center justify-between">
          {/* Left: Logo and Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground tracking-tight">
                Guardian Vision
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-border">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Cpu className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground">AI Online</span>
              </div>
              
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
                isSyncActive ? 'bg-primary/10' : 'bg-destructive/10'
              }`}>
                <motion.div
                  className={`w-1.5 h-1.5 rounded-full ${isSyncActive ? 'bg-primary' : 'bg-destructive'}`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <Link2 className={`w-3 h-3 ${isSyncActive ? 'text-primary' : 'text-destructive'}`} />
                <span className={`text-xs font-mono ${isSyncActive ? 'text-primary' : 'text-destructive'}`}>
                  {isSiteWideEmergency ? 'EMERGENCY' : isSyncActive ? 'Synced' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            {/* Sim Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isRunning 
                    ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                    : 'bg-amber/10 text-amber hover:bg-amber/20'
                }`}
              >
                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isRunning ? 'Pause' : 'Resume'}</span>
              </button>

              <button
                onClick={recenterMap}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/50 text-muted-foreground hover:bg-muted transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Recenter</span>
              </button>
            </div>

            <div className="h-6 w-px bg-border" />

            {/* Quick Stats */}
            <button
              onClick={toggleWorkersVisibility}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all ${
                showWorkers ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              {showWorkers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <Users className="w-3.5 h-3.5" />
              <span className="font-mono">{workers.length}</span>
            </button>

            <motion.button
              onClick={handleAlertsClick}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all ${
                activeAlerts > 0 ? 'bg-destructive/10 text-destructive' : 'bg-muted/50 text-muted-foreground'
              }`}
              animate={activeAlerts > 0 ? { opacity: [1, 0.7, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="font-mono">{activeAlerts}</span>
            </motion.button>

            <button 
              onClick={handleAlertsClick}
              className="relative p-2 hover:bg-muted/50 rounded-lg transition-all"
            >
              <Bell className="w-4 h-4 text-muted-foreground" />
              {activeAlerts > 0 && (
                <motion.span 
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full text-[9px] flex items-center justify-center text-destructive-foreground font-bold"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  {activeAlerts}
                </motion.span>
              )}
            </button>

            <div className="hidden lg:block text-right pl-3 border-l border-border">
              <p className="text-xs font-mono text-foreground">{formatTime(time)}</p>
              <p className="text-[10px] text-muted-foreground">{formatDate(time)}</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content - Scrollable Sections */}
      <main className="pt-16">
        {/* ============================================ */}
        {/* SECTION 1: MISSION CONTROL (Above the Fold) */}
        {/* ============================================ */}
        <section className="min-h-[calc(100vh-64px)] relative">
          <div className="max-w-[1800px] mx-auto px-6 py-6">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-foreground tracking-tight">Mission Control</h1>
                <p className="text-sm text-muted-foreground mt-1">Real-time site monitoring and worker safety overview</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Safety Pulse Stats */}
                <div className="flex items-center gap-6 px-4 py-3 bg-card rounded-xl border border-border">
                  <div className="text-center">
                    <p className="text-2xl font-mono font-semibold text-foreground">{workers.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Workers</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-2xl font-mono font-semibold text-primary">{safeWorkers}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Safe</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <p className={`text-2xl font-mono font-semibold ${warningWorkers > 0 ? 'text-amber' : 'text-muted-foreground'}`}>{warningWorkers}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">At Risk</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <motion.p 
                      className={`text-2xl font-mono font-semibold ${activeAlerts > 0 ? 'text-destructive' : 'text-muted-foreground'}`}
                      animate={activeAlerts > 0 ? { opacity: [1, 0.5, 1] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      {activeAlerts}
                    </motion.p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Hazards</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Bento Grid */}
            <div className="grid grid-cols-12 gap-4 auto-rows-min">
              {/* Left Column - Safety Pulse */}
              <div className="col-span-12 lg:col-span-3 space-y-4">
                <motion.div
                  className="bg-card rounded-xl border border-border p-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <VitalsPanel />
                </motion.div>
              </div>

              {/* Center - Site Map (Hex Grid) */}
              <div className="col-span-12 lg:col-span-6">
                <motion.div
                  className="bg-card rounded-xl border border-border p-4 aspect-square max-h-[600px] flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  }>
                    <HexGrid />
                  </Suspense>
                </motion.div>
              </div>

              {/* Right Column - Live Feed */}
              <div className="col-span-12 lg:col-span-3 space-y-4">
                <motion.div
                  className="bg-card rounded-xl border border-border overflow-hidden"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <LiveStreamPanel />
                </motion.div>
                
                {/* Quick Metrics */}
                <motion.div
                  className="bg-card rounded-xl border border-border p-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">System Status</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-[10px] text-muted-foreground mb-1">AI Processing</p>
                      <p className="text-lg font-mono font-semibold text-primary">98.2%</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-[10px] text-muted-foreground mb-1">Network</p>
                      <p className="text-lg font-mono font-semibold text-primary">Stable</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div 
              className="flex flex-col items-center mt-8 text-muted-foreground"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-xs mb-2">Scroll for more</span>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION 2: INCIDENT RESPONSE */}
        {/* ============================================ */}
        <section className="py-12 bg-muted/20 border-t border-border">
          <div className="max-w-[1800px] mx-auto px-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground tracking-tight">Incident Response</h2>
                <p className="text-sm text-muted-foreground mt-1">Active protocols and AI detection log</p>
              </div>
              {activeAlerts > 0 && (
                <motion.div 
                  className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 rounded-lg border border-destructive/20"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">{activeAlerts} Active Hazards</span>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-12 gap-4">
              {/* Response Protocol / Systems Status */}
              <div className="col-span-12 lg:col-span-5">
                <motion.div
                  className="bg-card rounded-xl border border-border h-full"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <AnimatePresence mode="wait">
                    {activeProtocol ? (
                      <ResponseProtocolPanel key="protocol" />
                    ) : (
                      <SystemsNominalPanel key="nominal" />
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* AI Detection Log */}
              <div className="col-span-12 lg:col-span-7">
                <motion.div
                  className="bg-card rounded-xl border border-border h-[500px] overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <CommsPanel />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION 3: FLEET ANALYTICS */}
        {/* ============================================ */}
        <section className="py-12 border-t border-border">
          <div className="max-w-[1800px] mx-auto px-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground tracking-tight">Fleet Analytics</h2>
                <p className="text-sm text-muted-foreground mt-1">PPE compliance and operational metrics</p>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Updated in real-time</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              {/* PPE Compliance */}
              <div className="col-span-12 lg:col-span-6">
                <motion.div
                  className="bg-card rounded-xl border border-border"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <MetricsPanel />
                </motion.div>
              </div>

              {/* Compliance Log */}
              <div className="col-span-12 lg:col-span-6">
                <motion.div
                  className="bg-card rounded-xl border border-border p-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Recent Activity Log</span>
                  </div>
                  
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2 pr-4">
                      {incidents.slice(0, 15).map((incident, idx) => (
                        <motion.div
                          key={incident.id}
                          className={`p-3 rounded-lg border ${
                            incident.resolved 
                              ? 'bg-muted/30 border-border' 
                              : incident.severity === 'critical'
                                ? 'bg-destructive/5 border-destructive/20'
                                : 'bg-amber/5 border-amber/20'
                          }`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                incident.resolved ? 'bg-muted-foreground' : 
                                incident.severity === 'critical' ? 'bg-destructive' : 'bg-amber'
                              }`} />
                              <span className="text-xs font-medium text-foreground">{incident.type.replace(/_/g, ' ').toUpperCase()}</span>
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {new Date(incident.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 pl-3.5">{incident.workerId}</p>
                        </motion.div>
                      ))}
                      {incidents.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                          <FileText className="w-8 h-8 mb-2 opacity-50" />
                          <p className="text-sm">No incidents recorded</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-6 border-t border-border bg-card">
          <div className="max-w-[1800px] mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Guardian Vision • Enterprise Safety Platform</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Version 2.4.0</span>
              <span>•</span>
              <span>Last sync: {formatTime(time)}</span>
            </div>
          </div>
        </footer>
      </main>

      {/* Subtle background grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,209,197,0.02)_0%,transparent_50%)]" />
      </div>
    </div>
  );
};

export default Dashboard;
