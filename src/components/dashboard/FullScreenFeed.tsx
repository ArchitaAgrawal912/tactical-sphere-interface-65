import { motion } from "framer-motion";
import { 
  X, 
  Camera, 
  Circle, 
  Target, 
  Lock, 
  Signal, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Maximize2,
  User,
  Radio
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";

interface FullScreenFeedProps {
  onClose: () => void;
}

const FullScreenFeed = ({ onClose }: FullScreenFeedProps) => {
  const [scanlinePos, setScanlinePos] = useState(0);
  const { 
    workers, 
    trackedWorkerId, 
    activeProtocol,
    activeIncident,
    verifyIncident,
    markFalseAlarm,
  } = useSimulationStore();
  
  const trackedWorker = workers.find(w => w.id === trackedWorkerId) || workers[0];
  const isTracking = !!trackedWorkerId;
  const isPendingVerification = activeProtocol?.verificationStatus === "pending";
  const isVerified = activeProtocol?.verificationStatus === "verified";
  const isFalseAlarm = activeProtocol?.verificationStatus === "false_alarm";
  const isIncidentWorker = activeIncident?.workerId === trackedWorker?.id;
  const isInRestrictedZone = trackedWorker?.inRestrictedZone;
  const isInDanger = trackedWorker?.status === "danger" || trackedWorker?.status === "warning";

  useEffect(() => {
    const interval = setInterval(() => {
      setScanlinePos(prev => (prev + 1) % 100);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-obsidian"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Scanline effect overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.2) 0px,
            rgba(0, 0, 0, 0.2) 2px,
            transparent 2px,
            transparent 4px
          )`
        }}
      />

      {/* Moving scanline */}
      <div
        className="absolute left-0 right-0 h-1 bg-cyan/30 pointer-events-none z-20"
        style={{ top: `${scanlinePos}%`, boxShadow: "0 0 20px rgba(0,242,255,0.5)" }}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-6 bg-gradient-to-b from-obsidian via-obsidian/80 to-transparent">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-cyan" />
            <span className="text-lg font-mono font-bold tracking-widest uppercase text-cyan">
              Live Feed - Full Screen
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-3 h-3 fill-danger text-danger animate-pulse" />
            <span className="text-sm font-mono text-danger">RECORDING</span>
          </div>
        </div>

        <motion.button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded border border-cyan/30 bg-cyan/10 text-cyan font-mono text-sm hover:bg-cyan/20 hover:border-cyan hover:shadow-[0_0_20px_rgba(0,242,255,0.3)] transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <X className="w-4 h-4" />
          RETURN TO HUD
        </motion.button>
      </div>

      {/* Main feed area */}
      <div className="absolute inset-0 flex items-center justify-center p-20">
        <div className={`relative w-full h-full max-w-6xl border-2 rounded-lg overflow-hidden ${
          isIncidentWorker && isPendingVerification ? 'border-ember' :
          isInRestrictedZone ? 'border-[#FF8C00]' : isInDanger ? 'border-ember/50' : 'border-cyan/30'
        }`}>
          {/* Grid overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <pattern id="fullGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#fullGrid)" />
          </svg>

          {/* Center crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div 
              className={`w-24 h-24 border-2 rounded-full ${
                isInRestrictedZone ? 'border-[#FF8C00]' : 'border-cyan/50'
              }`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className={`absolute top-1/2 left-0 w-8 h-px ${isInRestrictedZone ? 'bg-[#FF8C00]/50' : 'bg-cyan/50'}`} />
            <div className={`absolute top-1/2 right-0 w-8 h-px translate-x-full ${isInRestrictedZone ? 'bg-[#FF8C00]/50' : 'bg-cyan/50'}`} />
            <div className={`absolute left-1/2 top-0 w-px h-8 -translate-y-full ${isInRestrictedZone ? 'bg-[#FF8C00]/50' : 'bg-cyan/50'}`} />
            <div className={`absolute left-1/2 bottom-0 w-px h-8 translate-y-full ${isInRestrictedZone ? 'bg-[#FF8C00]/50' : 'bg-cyan/50'}`} />
          </div>

          {/* Target tracking box */}
          {trackedWorker && (
            <motion.div
              className={`absolute border-4 ${
                isInRestrictedZone ? 'border-[#FF8C00]' : 
                trackedWorker.status === "danger" ? 'border-danger' :
                trackedWorker.status === "warning" ? 'border-ember' : 'border-cyan'
              }`}
              style={{
                left: "35%",
                top: "25%",
                width: "30%",
                height: "50%",
              }}
              animate={{ 
                opacity: [1, 0.7, 1],
                boxShadow: isInRestrictedZone 
                  ? ["0 0 20px rgba(255,140,0,0.5)", "0 0 40px rgba(255,140,0,0.8)", "0 0 20px rgba(255,140,0,0.5)"]
                  : ["0 0 20px rgba(0,242,255,0.5)", "0 0 40px rgba(0,242,255,0.8)", "0 0 20px rgba(0,242,255,0.5)"]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {/* Corner brackets */}
              <div className={`absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 ${
                isInRestrictedZone ? 'border-[#FF8C00]' : 'border-cyan'
              }`} />
              <div className={`absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 ${
                isInRestrictedZone ? 'border-[#FF8C00]' : 'border-cyan'
              }`} />
              <div className={`absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 ${
                isInRestrictedZone ? 'border-[#FF8C00]' : 'border-cyan'
              }`} />
              <div className={`absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 ${
                isInRestrictedZone ? 'border-[#FF8C00]' : 'border-cyan'
              }`} />

              {/* Worker ID tag */}
              <div className={`absolute -top-10 left-0 flex items-center gap-2 px-3 py-1 rounded ${
                isInRestrictedZone ? 'bg-[#FF8C00]/20 border border-[#FF8C00]/50' :
                'bg-cyan/20 border border-cyan/50'
              }`}>
                <Target className={`w-4 h-4 ${isInRestrictedZone ? 'text-[#FF8C00]' : 'text-cyan'}`} />
                <span className={`font-mono font-bold ${isInRestrictedZone ? 'text-[#FF8C00]' : 'text-cyan'}`}>
                  {trackedWorker.id}
                </span>
              </div>

              {/* Biometrics overlay */}
              <div className="absolute -bottom-16 left-0 bg-obsidian/80 border border-cyan/20 rounded p-3">
                <div className="flex items-center gap-6 text-sm font-mono">
                  <div className={trackedWorker.hrElevated ? 'text-ember' : 'text-cyan'}>
                    HR: {trackedWorker.heartRate} BPM
                  </div>
                  <div className="text-cyan">
                    O2: {trackedWorker.oxygenLevel}%
                  </div>
                  <div className={trackedWorker.ppe >= 90 ? 'text-cyan' : trackedWorker.ppe >= 70 ? 'text-ember' : 'text-danger'}>
                    PPE: {trackedWorker.ppe}%
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Status overlays */}
          {isIncidentWorker && isPendingVerification && (
            <motion.div
              className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-ember/20 border border-ember rounded"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <AlertTriangle className="w-5 h-5 text-ember" />
              <span className="font-mono text-ember font-bold">PENDING VERIFICATION</span>
            </motion.div>
          )}

          {isIncidentWorker && isVerified && (
            <motion.div
              className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-danger/20 border border-danger rounded"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <CheckCircle className="w-5 h-5 text-danger" />
              <span className="font-mono text-danger font-bold">VERIFIED EMERGENCY</span>
            </motion.div>
          )}

          {isTracking && !isIncidentWorker && (
            <motion.div
              className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-cyan/20 border border-cyan rounded"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <Lock className="w-5 h-5 text-cyan" />
              <span className="font-mono text-cyan font-bold">TARGET LOCKED</span>
            </motion.div>
          )}

          {isInRestrictedZone && (
            <motion.div
              className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-[#FF8C00]/20 border border-[#FF8C00] rounded"
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <AlertTriangle className="w-5 h-5 text-[#FF8C00]" />
              <span className="font-mono text-[#FF8C00] font-bold">ZONE BREACH DETECTED</span>
            </motion.div>
          )}

          {/* Corner brackets */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan/50" />
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan/50" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan/50" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan/50" />

          {/* Timestamp */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-cyan/70 text-sm">
            COORDINATES: [{trackedWorker?.position.x.toFixed(2)}, {trackedWorker?.position.y.toFixed(2)}] | ZOOM: 100%
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      {isIncidentWorker && isPendingVerification && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-4">
          <motion.button
            onClick={verifyIncident}
            className="flex items-center gap-2 px-6 py-3 rounded border-2 border-danger bg-danger/20 text-danger font-mono font-bold hover:bg-danger/30 hover:shadow-[0_0_20px_rgba(255,0,0,0.5)] transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <CheckCircle className="w-5 h-5" />
            CONFIRM INCIDENT
          </motion.button>
          <motion.button
            onClick={markFalseAlarm}
            className="flex items-center gap-2 px-6 py-3 rounded border-2 border-muted bg-muted/20 text-muted-foreground font-mono font-bold hover:bg-muted/30 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <XCircle className="w-5 h-5" />
            FALSE ALARM
          </motion.button>
        </div>
      )}

      {/* Side panel - worker list */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-30 glass-panel p-4 w-48">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-cyan" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan">Tracked</span>
        </div>
        <div className="space-y-2">
          {workers.slice(0, 5).map((worker) => (
            <div 
              key={worker.id}
              className={`flex items-center gap-2 px-2 py-1.5 rounded border ${
                worker.id === trackedWorkerId 
                  ? 'border-cyan bg-cyan/10' 
                  : 'border-cyan/20 bg-obsidian/50'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                worker.status === "safe" ? 'bg-cyan' :
                worker.status === "warning" ? 'bg-ember' : 'bg-danger'
              }`} />
              <span className={`text-xs font-mono ${
                worker.id === trackedWorkerId ? 'text-cyan font-bold' : 'text-muted-foreground'
              }`}>
                {worker.id}
              </span>
              {worker.inRestrictedZone && (
                <AlertTriangle className="w-3 h-3 text-[#FF8C00] ml-auto" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Audio waveform */}
      <div className="absolute left-6 bottom-6 z-30 flex items-center gap-3 px-4 py-2 glass-panel">
        <Radio className="w-4 h-4 text-cyan" />
        <span className="text-xs font-mono text-muted-foreground">AUDIO</span>
        <div className="flex items-center gap-0.5">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-cyan/60 rounded-full"
              animate={{
                height: [4, Math.random() * 16 + 6, 4],
              }}
              transition={{
                duration: 0.3 + Math.random() * 0.3,
                repeat: Infinity,
                delay: i * 0.03,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FullScreenFeed;
