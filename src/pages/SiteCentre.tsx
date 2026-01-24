import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { 
  Radio, 
  Wifi, 
  AlertTriangle, 
  Shield, 
  Skull, 
  UserX, 
  Flame, 
  Send, 
  ArrowLeft,
  Lock,
  Activity,
  Volume2,
  Signal,
  Zap
} from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { broadcastIncident, broadcastMessage as broadcastMsgToTabs } from "@/hooks/useCrossTabSync";

// Haptic feedback helper
const triggerHaptic = (pattern: "light" | "medium" | "heavy" = "medium") => {
  if ("vibrate" in navigator) {
    const patterns = {
      light: [50],
      medium: [100],
      heavy: [200, 50, 200],
    };
    navigator.vibrate(patterns[pattern]);
  }
};

const SiteCentre = () => {
  const { 
    addLog, 
    workers,
    isRunning,
    setIsRunning,
    triggerGlitch,
    triggerViolationFlash,
    updateWorker,
    addIncident,
  } = useSimulationStore();

  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [connectionLatency] = useState(Math.floor(Math.random() * 15) + 8);
  const [lastAction, setLastAction] = useState<string | null>(null);

  // Format current timestamp
  const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", { hour12: false });
  };

  // Trigger fall incident with cross-tab sync
  const handleTriggerFall = useCallback(() => {
    triggerHaptic("heavy");
    
    const worker = workers.find(w => w.id === "W-004") || workers[3];
    const incident = {
      id: `incident-${Date.now()}`,
      workerId: "W-004",
      workerName: worker?.name || "Marcus Chen",
      type: "fall" as const,
      severity: "critical" as const,
      timestamp: Date.now(),
      position: worker?.position || { x: 0, y: 0 },
      resolved: false,
      aiAnalysis: `CRITICAL: AI Analysis detected sudden vertical acceleration change for W-004. High probability of slip-and-fall incident. GPS coordinates locked. Emergency response required.`,
    };
    
    const log = {
      timestamp: formatTimestamp(),
      type: "critical" as const,
      message: incident.aiAnalysis,
      workerId: "W-004",
      priority: 100,
      incident,
    };
    
    // Update local state
    addIncident(incident);
    addLog(log);
    updateWorker("W-004", { status: "danger" as const });
    triggerGlitch();
    triggerViolationFlash();
    
    // Broadcast to other tabs (Dashboard)
    broadcastIncident({
      incident,
      log,
      workerUpdate: { id: "W-004", updates: { status: "danger" } },
      triggerGlitch: true,
      triggerViolationFlash: true,
    });
    
    setLastAction("FALL DETECTED - W-004");
  }, [workers, addIncident, addLog, updateWorker, triggerGlitch, triggerViolationFlash]);

  // Trigger zone breach
  const handleZoneBreach = useCallback(() => {
    triggerHaptic("medium");
    const worker = workers.find(w => w.id === "W-002") || workers[1];
    
    if (worker) {
      updateWorker(worker.id, { 
        inRestrictedZone: true, 
        status: "warning" as const 
      });
      
      const incident = {
        id: `incident-${Date.now()}`,
        workerId: worker.id,
        workerName: worker.name,
        type: "restricted_zone" as const,
        severity: "high" as const,
        timestamp: Date.now(),
        position: { ...worker.position },
        resolved: false,
        aiAnalysis: `BREACH ALERT: ${worker.id} has entered RESTRICTED ZONE. Unauthorized access detected at perimeter. Immediate containment required.`,
      };
      
      addIncident(incident);
      addLog({
        timestamp: formatTimestamp(),
        type: "alert",
        message: incident.aiAnalysis,
        workerId: worker.id,
        priority: 85,
        incident,
      });
      
      triggerViolationFlash();
      setLastAction(`ZONE BREACH - ${worker.id}`);
      // Broadcast to other tabs
      broadcastIncident({
        incident,
        log: {
          timestamp: formatTimestamp(),
          type: "alert" as const,
          message: incident.aiAnalysis,
          workerId: worker.id,
          priority: 85,
          incident,
        },
        workerUpdate: { id: worker.id, updates: { inRestrictedZone: true, status: "warning" } },
        triggerViolationFlash: true,
      });
    }
  }, [workers, updateWorker, addIncident, addLog, triggerViolationFlash]);

  // Trigger PPE error
  const handlePPEError = useCallback(() => {
    triggerHaptic("medium");
    const randomWorker = workers[Math.floor(Math.random() * workers.length)];
    const ppeTypes = ["helmet", "vest", "goggles"];
    const missingPPE = ppeTypes[Math.floor(Math.random() * ppeTypes.length)];
    
    updateWorker(randomWorker.id, { 
      ppe: Math.max(30, randomWorker.ppe - 35),
      status: "warning" as const,
    });
    
    const incident = {
      id: `incident-${Date.now()}`,
      workerId: randomWorker.id,
      workerName: randomWorker.name,
      type: "ppe_violation" as const,
      severity: "high" as const,
      timestamp: Date.now(),
      position: { ...randomWorker.position },
      resolved: false,
      aiAnalysis: `PPE VIOLATION: AI Vision detected ${randomWorker.id} is missing ${missingPPE.toUpperCase()}. Safety compliance compromised. Supervisor notification required.`,
    };
    
    addIncident(incident);
    addLog({
      timestamp: formatTimestamp(),
      type: "alert",
      message: incident.aiAnalysis,
      workerId: randomWorker.id,
      priority: 75,
      incident,
    });
    
    triggerViolationFlash();
    setLastAction(`PPE ERROR - ${randomWorker.id}`);
    // Broadcast to other tabs
    broadcastIncident({
      incident,
      log: {
        timestamp: formatTimestamp(),
        type: "alert" as const,
        message: incident.aiAnalysis,
        workerId: randomWorker.id,
        priority: 75,
        incident,
      },
      workerUpdate: { id: randomWorker.id, updates: { ppe: Math.max(30, randomWorker.ppe - 35), status: "warning" } },
      triggerViolationFlash: true,
    });
  }, [workers, updateWorker, addIncident, addLog, triggerViolationFlash]);

  // Trigger gas leak
  const handleGasLeak = useCallback(() => {
    triggerHaptic("heavy");
    const nearbyWorkers = workers.slice(0, 3);
    
    // Update multiple workers' status
    nearbyWorkers.forEach(w => {
      updateWorker(w.id, { status: "danger" as const });
    });
    
    const incident = {
      id: `incident-${Date.now()}`,
      workerId: "W-001",
      workerName: workers[0].name,
      type: "environmental" as const,
      severity: "critical" as const,
      timestamp: Date.now(),
      position: { x: 0, y: 0 },
      resolved: false,
      aiAnalysis: `🔴 CRITICAL: Gas leak detected in Sector Alpha. Environmental sensors reading dangerous levels. Multiple workers at risk. Immediate evacuation required.`,
    };
    
    addIncident(incident);
    addLog({
      timestamp: formatTimestamp(),
      type: "critical",
      message: incident.aiAnalysis,
      priority: 100,
      incident,
    });
    
    triggerGlitch();
    triggerViolationFlash();
    setLastAction("GAS LEAK - SECTOR ALPHA");
    // Broadcast to other tabs
    broadcastIncident({
      incident,
      log: {
        timestamp: formatTimestamp(),
        type: "critical" as const,
        message: incident.aiAnalysis,
        priority: 100,
        incident,
      },
      workerUpdate: { id: "W-001", updates: { status: "danger" } },
      triggerGlitch: true,
      triggerViolationFlash: true,
    });
  }, [workers, updateWorker, addIncident, addLog, triggerGlitch, triggerViolationFlash]);

  // Send broadcast message with cross-tab sync
  const handleBroadcast = useCallback(() => {
    if (!broadcastMsg.trim()) return;
    
    triggerHaptic("light");
    
    const log = {
      timestamp: formatTimestamp(),
      type: "info" as const,
      message: `📡 FIELD BROADCAST: "${broadcastMsg}"`,
      priority: 60,
    };
    
    // Update local state
    addLog(log);
    
    // Broadcast to other tabs
    broadcastMsgToTabs(log);
    
    setBroadcastMsg("");
    setLastAction("BROADCAST SENT");
  }, [broadcastMsg, addLog]);

  return (
    <div className="min-h-screen bg-obsidian text-foreground">
      {/* Rugged Industrial Header */}
      <header className="sticky top-0 z-50 bg-obsidian/95 backdrop-blur-sm border-b-2 border-ember/50 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 text-cyan hover:text-cyan/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xs font-mono">CONTROL OFFICE</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 bg-cyan rounded-full"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[10px] font-mono text-cyan">LIVE SYNC</span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Field Cam Placeholder */}
        <motion.div
          className="relative aspect-video bg-obsidian-light rounded-lg overflow-hidden border-2 border-cyan/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Simulated camera feed with animated grain */}
          <div className="absolute inset-0 bg-gradient-to-br from-obsidian via-obsidian-light to-obsidian" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMwMDAiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMTExIi8+PC9zdmc+')] opacity-30" />
          
          {/* Scanlines */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,242,255,0.03)_2px,rgba(0,242,255,0.03)_4px)]" />
          </div>
          
          {/* Camera Label */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <motion.div
              className="w-2 h-2 bg-danger rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <span className="text-[10px] font-mono text-white bg-obsidian/80 px-2 py-0.5 rounded">
              FIELD CAM 01
            </span>
          </div>
          
          {/* Simulated camera view content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Activity className="w-12 h-12 text-cyan/40 mx-auto mb-2" />
                <p className="text-[10px] font-mono text-cyan/60">CONSTRUCTION SITE - SECTOR NORTH</p>
                <p className="text-[8px] font-mono text-muted-foreground mt-1">Live feed active</p>
              </motion.div>
            </div>
          </div>
          
          {/* Timestamp overlay */}
          <div className="absolute bottom-3 right-3 text-[9px] font-mono text-cyan/70 bg-obsidian/80 px-2 py-0.5 rounded">
            {new Date().toLocaleTimeString("en-US", { hour12: false })}
          </div>
        </motion.div>

        {/* Connection Status */}
        <motion.div
          className="flex items-center justify-between px-4 py-3 bg-obsidian-light/50 rounded-lg border border-cyan/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-cyan" />
            <div>
              <p className="text-[10px] font-mono text-cyan font-bold">CONNECTION: ENCRYPTED</p>
              <p className="text-[9px] font-mono text-muted-foreground">AES-256 • TLS 1.3</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Signal className="w-4 h-4 text-cyan" />
            <div className="text-right">
              <p className="text-[10px] font-mono text-cyan font-bold">LATENCY</p>
              <p className="text-[9px] font-mono text-muted-foreground">{connectionLatency}ms</p>
            </div>
          </div>
        </motion.div>

        {/* Incident Trigger Control Pad */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-ember" />
            <h2 className="text-xs font-mono font-bold text-ember tracking-wider uppercase">
              Incident Trigger Pad
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Trigger Fall */}
            <motion.button
              onClick={handleTriggerFall}
              className="relative flex flex-col items-center justify-center gap-2 p-6 bg-danger/10 border-2 border-danger/50 rounded-lg text-danger hover:bg-danger/20 hover:border-danger transition-all active:scale-95"
              whileTap={{ scale: 0.95 }}
              whileHover={{ boxShadow: "0 0 20px rgba(255, 0, 0, 0.4)" }}
            >
              <Skull className="w-8 h-8" />
              <span className="text-xs font-mono font-bold uppercase">Trigger Fall</span>
              <span className="text-[8px] font-mono opacity-60">W-004</span>
            </motion.button>

            {/* Zone Breach */}
            <motion.button
              onClick={handleZoneBreach}
              className="relative flex flex-col items-center justify-center gap-2 p-6 bg-ember/10 border-2 border-ember/50 rounded-lg text-ember hover:bg-ember/20 hover:border-ember transition-all active:scale-95"
              whileTap={{ scale: 0.95 }}
              whileHover={{ boxShadow: "0 0 20px rgba(255, 191, 0, 0.4)" }}
            >
              <Shield className="w-8 h-8" />
              <span className="text-xs font-mono font-bold uppercase">Zone Breach</span>
              <span className="text-[8px] font-mono opacity-60">Restricted Area</span>
            </motion.button>

            {/* PPE Error */}
            <motion.button
              onClick={handlePPEError}
              className="relative flex flex-col items-center justify-center gap-2 p-6 bg-ember/10 border-2 border-ember/50 rounded-lg text-ember hover:bg-ember/20 hover:border-ember transition-all active:scale-95"
              whileTap={{ scale: 0.95 }}
              whileHover={{ boxShadow: "0 0 20px rgba(255, 191, 0, 0.4)" }}
            >
              <UserX className="w-8 h-8" />
              <span className="text-xs font-mono font-bold uppercase">PPE Error</span>
              <span className="text-[8px] font-mono opacity-60">Random Worker</span>
            </motion.button>

            {/* Gas Leak */}
            <motion.button
              onClick={handleGasLeak}
              className="relative flex flex-col items-center justify-center gap-2 p-6 bg-danger/10 border-2 border-danger/50 rounded-lg text-danger hover:bg-danger/20 hover:border-danger transition-all active:scale-95"
              whileTap={{ scale: 0.95 }}
              whileHover={{ boxShadow: "0 0 20px rgba(255, 0, 0, 0.4)" }}
            >
              <Flame className="w-8 h-8" />
              <span className="text-xs font-mono font-bold uppercase">Gas Leak</span>
              <span className="text-[8px] font-mono opacity-60">Sector Alpha</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Last Action Feedback */}
        {lastAction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-ember/10 border border-ember/30 rounded-lg"
          >
            <AlertTriangle className="w-4 h-4 text-ember" />
            <span className="text-[10px] font-mono text-ember font-bold">{lastAction}</span>
          </motion.div>
        )}

        {/* Broadcast Message */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan" />
            <h2 className="text-xs font-mono font-bold text-cyan tracking-wider uppercase">
              Broadcast Message
            </h2>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleBroadcast()}
              placeholder="Type message to Control Office..."
              className="flex-1 bg-obsidian border-2 border-cyan/30 rounded-lg px-4 py-3 text-sm font-mono text-cyan placeholder:text-muted-foreground/50 focus:outline-none focus:border-cyan transition-colors"
            />
            <motion.button
              onClick={handleBroadcast}
              disabled={!broadcastMsg.trim()}
              className="px-4 bg-cyan/20 border-2 border-cyan rounded-lg text-cyan hover:bg-cyan/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Simulation Control */}
        <motion.div
          className="flex items-center justify-between px-4 py-3 bg-obsidian-light/30 rounded-lg border border-muted/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-[10px] font-mono text-muted-foreground">SIMULATION</span>
          </div>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-4 py-1.5 rounded text-[10px] font-mono font-bold uppercase transition-all ${
              isRunning 
                ? 'bg-cyan/20 border border-cyan/50 text-cyan' 
                : 'bg-ember/20 border border-ember/50 text-ember'
            }`}
          >
            {isRunning ? "RUNNING" : "PAUSED"}
          </button>
        </motion.div>

        {/* Workers Status Grid */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-cyan" />
            <h2 className="text-xs font-mono font-bold text-cyan tracking-wider uppercase">
              Active Workers
            </h2>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {workers.map((worker) => (
              <motion.div
                key={worker.id}
                className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                  worker.status === "danger" 
                    ? "bg-danger/10 border-danger/50" 
                    : worker.status === "warning"
                      ? "bg-ember/10 border-ember/50"
                      : "bg-cyan/5 border-cyan/20"
                }`}
                animate={worker.status === "danger" ? { 
                  boxShadow: ["0 0 5px rgba(255,0,0,0.3)", "0 0 15px rgba(255,0,0,0.5)", "0 0 5px rgba(255,0,0,0.3)"]
                } : {}}
                transition={{ duration: 1, repeat: worker.status === "danger" ? Infinity : 0 }}
              >
                <motion.div
                  className={`w-3 h-3 rounded-full mb-1 ${
                    worker.status === "danger" 
                      ? "bg-danger" 
                      : worker.status === "warning"
                        ? "bg-ember"
                        : "bg-cyan"
                  }`}
                  animate={worker.status !== "safe" ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
                <span className="text-[8px] font-mono text-muted-foreground">
                  {worker.id.replace("W-", "")}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-obsidian/95 backdrop-blur-sm border-t border-cyan/20 px-4 py-2">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <span className="text-[9px] font-mono text-muted-foreground">
            SITE CENTRE v1.0
          </span>
          <div className="flex items-center gap-1">
            <motion.div
              className="w-1.5 h-1.5 bg-cyan rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-[9px] font-mono text-cyan">SYNCED</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SiteCentre;
