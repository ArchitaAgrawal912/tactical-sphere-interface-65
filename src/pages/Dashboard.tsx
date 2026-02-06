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
  Eye, EyeOff, Cpu, Link2, BarChart3, FileText 
} from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { useWorkerSim } from "@/hooks/useWorkerSim";
import { useBroadcastSync } from "@/hooks/useBroadcastSync";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  const handleAlertsClick = () => {
    scrollToLatestAlert();
    const latestCriticalIncident = incidents.find(i => !i.resolved && (i.severity === "critical" || i.severity === "high"));
    if (latestCriticalIncident) {
      activateProtocol(latestCriticalIncident);
    }
  };

  return (
    <div className={`h-screen overflow-hidden bg-background transition-all duration-200 ${
      isGlitching ? 'animate-[glitch_0.3s_ease-in-out]' : ''
    }`}>
      {/* Critical alert overlay */}
      {isGlitching && (
        <motion.div
          className="fixed inset-0 z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.2, 0] }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-destructive/10" />
        </motion.div>
      )}

      {/* Violation flash overlay */}
      {violationFlash && (
        <motion.div
          className="fixed inset-0 z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.08, 0] }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-amber/10" />
        </motion.div>
      )}

      {/* Professional Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border px-6 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground tracking-tight">Guardian Vision</span>
          </div>
          
          <div className="hidden md:flex items-center gap-3 pl-4 border-l border-border">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Cpu className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">AI Online</span>
            </div>
            
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${
              isSyncActive ? 'bg-primary/10' : 'bg-destructive/10'
            }`}>
              <motion.div
                className={`w-1.5 h-1.5 rounded-full ${isSyncActive ? 'bg-primary' : 'bg-destructive'}`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <Link2 className={`w-3 h-3 ${isSyncActive ? 'text-primary' : 'text-destructive'}`} />
              <span className={`text-[10px] font-mono uppercase tracking-widest ${isSyncActive ? 'text-primary' : 'text-destructive'}`}>
                {isSiteWideEmergency ? 'Emergency' : isSyncActive ? 'Synced' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                isRunning 
                  ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                  : 'bg-amber/10 text-amber hover:bg-amber/20'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline uppercase tracking-widest text-[10px]">{isRunning ? 'Pause' : 'Resume'}</span>
            </button>

            <button
              onClick={recenterMap}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-muted/50 text-muted-foreground hover:bg-muted transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline uppercase tracking-widest text-[10px]">Recenter</span>
            </button>
          </div>

          <div className="h-6 w-px bg-border" />

          <button
            onClick={toggleWorkersVisibility}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors ${
              showWorkers ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground'
            }`}
          >
            {showWorkers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <Users className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px]">{workers.length}</span>
          </button>

          <motion.button
            onClick={handleAlertsClick}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors ${
              activeAlerts > 0 ? 'bg-destructive/10 text-destructive' : 'bg-muted/50 text-muted-foreground'
            }`}
            animate={activeAlerts > 0 ? { opacity: [1, 0.7, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px]">{activeAlerts}</span>
          </motion.button>

          <button 
            onClick={handleAlertsClick}
            className="relative p-2 hover:bg-muted/50 rounded transition-colors"
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
      </header>

      {/* Main Layout: Fixed 3-Column Grid */}
      <div className="pt-14 h-screen grid grid-cols-1 lg:grid-cols-[320px_1fr_320px] xl:grid-cols-[360px_1fr_360px]">
        
        {/* LEFT SIDEBAR - Scrollable */}
        <aside className="hidden lg:flex flex-col h-[calc(100vh-56px)] border-r border-border bg-card/50">
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Safety Pulse Header */}
              <div>
                <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Safety Pulse</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Workers</p>
                    <p className="text-2xl font-mono font-semibold text-foreground">{workers.length}</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Safe</p>
                    <p className="text-2xl font-mono font-semibold text-primary">{safeWorkers}</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">At Risk</p>
                    <p className={`text-2xl font-mono font-semibold ${workers.length - safeWorkers > 0 ? 'text-amber' : 'text-muted-foreground'}`}>
                      {workers.length - safeWorkers}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Hazards</p>
                    <motion.p 
                      className={`text-2xl font-mono font-semibold ${activeAlerts > 0 ? 'text-destructive' : 'text-muted-foreground'}`}
                      animate={activeAlerts > 0 ? { opacity: [1, 0.5, 1] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      {activeAlerts}
                    </motion.p>
                  </div>
                </div>
              </div>

              {/* Vitals Panel */}
              <div className="rounded-lg border border-border bg-card p-4">
                <VitalsPanel />
              </div>

              {/* Response Protocol / Systems Status */}
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <AnimatePresence mode="wait">
                  {activeProtocol ? (
                    <ResponseProtocolPanel key="protocol" />
                  ) : (
                    <SystemsNominalPanel key="nominal" />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* CENTER - Fixed Tactical Sphere */}
        <main className="relative h-[calc(100vh-56px)] flex items-center justify-center bg-background overflow-hidden p-6">
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-[0.03]">
            <svg className="w-full h-full">
              <pattern id="dashGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#dashGrid)" />
            </svg>
          </div>

          {/* Tactical Sphere Container - Centered and contained */}
          <div className="relative w-full max-w-[600px] aspect-square">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              <HexGrid />
            </Suspense>
          </div>

          {/* Corner Stats - Absolutely positioned */}
          <div className="absolute bottom-6 left-6 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card/80 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Live Tracking</span>
          </div>

          <div className="absolute bottom-6 right-6 flex items-center gap-4 px-3 py-2 rounded-lg border border-border bg-card/80 backdrop-blur-sm">
            <div>
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Accuracy</p>
              <p className="text-sm font-mono font-semibold text-primary">98.7%</p>
            </div>
            <div className="w-px h-6 bg-border" />
            <div>
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Response</p>
              <p className="text-sm font-mono font-semibold text-foreground">&lt;2.4s</p>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR - Scrollable */}
        <aside className="hidden lg:flex flex-col h-[calc(100vh-56px)] border-l border-border bg-card/50">
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Live Feed */}
              <div>
                <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Live Feed</h2>
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <LiveStreamPanel />
                </div>
              </div>

              {/* AI Detection Log */}
              <div>
                <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">AI Detection Log</h2>
                <div className="rounded-lg border border-border bg-card h-[300px] overflow-hidden">
                  <CommsPanel />
                </div>
              </div>

              {/* PPE Compliance */}
              <div>
                <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Fleet Analytics</h2>
                <div className="rounded-lg border border-border bg-card">
                  <MetricsPanel />
                </div>
              </div>

              {/* Activity Log */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Recent Activity</h2>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin">
                    {incidents.slice(0, 8).map((incident, idx) => (
                      <div
                        key={incident.id}
                        className={`p-2.5 rounded border ${
                          incident.resolved 
                            ? 'bg-muted/30 border-border' 
                            : incident.severity === 'critical'
                              ? 'bg-destructive/5 border-destructive/20'
                              : 'bg-amber/5 border-amber/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              incident.resolved ? 'bg-muted-foreground' : 
                              incident.severity === 'critical' ? 'bg-destructive' : 'bg-amber'
                            }`} />
                            <span className="text-[10px] font-mono text-foreground uppercase tracking-wider">
                              {incident.type.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-muted-foreground">
                            {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-muted-foreground mt-1 pl-3.5">{incident.workerId}</p>
                      </div>
                    ))}
                    {incidents.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <BarChart3 className="w-6 h-6 mb-2 opacity-50" />
                        <p className="text-xs">No incidents recorded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>
      </div>

      {/* Mobile Layout Fallback */}
      <div className="lg:hidden pt-14 h-screen overflow-auto">
        <div className="p-4 space-y-4">
          {/* Tactical sphere for mobile */}
          <div className="aspect-square max-w-[400px] mx-auto">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              <HexGrid />
            </Suspense>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-border bg-card">
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Workers</p>
              <p className="text-xl font-mono font-semibold text-foreground">{workers.length}</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-card">
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Hazards</p>
              <p className={`text-xl font-mono font-semibold ${activeAlerts > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {activeAlerts}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <LiveStreamPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
