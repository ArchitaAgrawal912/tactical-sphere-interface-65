import { motion, AnimatePresence } from "framer-motion";
import { Camera, Circle, Maximize2, User, Target, Lock, Signal, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";

const LiveStreamPanel = () => {
  const [scanlinePos, setScanlinePos] = useState(0);
  const [signalAcquired, setSignalAcquired] = useState(false);
  const { 
    workers, 
    trackedWorkerId, 
    setTrackedWorkerId, 
    focusedWorkerId,
    setFocusedWorkerId,
    setIsWarping,
    setZoomLevel,
    isWarping,
    activeProtocol,
    activeIncident,
    verifyIncident,
    markFalseAlarm,
  } = useSimulationStore();
  
  // Get tracked worker or default to first worker
  const trackedWorker = workers.find(w => w.id === trackedWorkerId) || workers[0];
  const [currentCam, setCurrentCam] = useState(0);
  const isTracking = !!trackedWorkerId;

  // Check if we're in verification mode
  const isPendingVerification = activeProtocol?.verificationStatus === "pending";
  const isVerified = activeProtocol?.verificationStatus === "verified";
  const isFalseAlarm = activeProtocol?.verificationStatus === "false_alarm";

  useEffect(() => {
    const interval = setInterval(() => {
      setScanlinePos(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Update camera when worker is focused
  useEffect(() => {
    if (focusedWorkerId) {
      const workerIndex = workers.findIndex(w => w.id === focusedWorkerId);
      if (workerIndex !== -1) {
        setCurrentCam(workerIndex);
      }
    }
  }, [focusedWorkerId, workers]);

  // Show SIGNAL ACQUIRED when warp completes
  useEffect(() => {
    if (isWarping) {
      setSignalAcquired(false);
    }
  }, [isWarping]);

  useEffect(() => {
    if (!isWarping && focusedWorkerId) {
      // Slight delay after warp completes
      const timer = setTimeout(() => {
        setSignalAcquired(true);
        // Hide after 2 seconds
        setTimeout(() => setSignalAcquired(false), 2000);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isWarping, focusedWorkerId]);

  const handleCamSelect = (index: number) => {
    setCurrentCam(index);
    const worker = workers[index];
    if (worker) {
      setTrackedWorkerId(worker.id);
      setFocusedWorkerId(worker.id);
      setIsWarping(true);
      setZoomLevel(1.25); // Match the reduced zoom level
      setTimeout(() => setIsWarping(false), 800);
      setTimeout(() => setZoomLevel(1), 10000);
    }
  };

  const displayWorker = workers[currentCam] || workers[0];
  const isInDanger = displayWorker?.status === "danger" || displayWorker?.status === "warning";
  const isInRestrictedZone = displayWorker?.inRestrictedZone;
  const isIncidentWorker = activeIncident?.workerId === displayWorker?.id;

  return (
    <motion.div
      className="glass-panel clip-corner-tr p-4 w-80"
      style={{ transform: "rotate(2deg)" }}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-cyan" />
          <span className="hud-label">Live Feed</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className={`w-2 h-2 fill-danger text-danger animate-pulse`} />
          <span className="text-[10px] font-mono text-danger">REC</span>
          <Maximize2 className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-cyan transition-colors" />
        </div>
      </div>

      {/* Video frame with scanline effect */}
      <div className={`relative aspect-video bg-obsidian rounded overflow-hidden border ${
        isIncidentWorker && isPendingVerification ? 'border-ember/50' :
        isInRestrictedZone ? 'border-[#FF8C00]/50' : isInDanger ? 'border-ember/30' : 'border-cyan/20'
      }`}>
        {/* Fake video content - gradient placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-obsidian via-obsidian-light to-obsidian">
          {/* Simulated camera view elements */}
          <div className="absolute inset-4 border border-cyan/10 rounded">
            {/* Grid overlay */}
            <svg className="absolute inset-0 w-full h-full opacity-30">
              <pattern id="camGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#camGrid)" />
            </svg>
          </div>

          {/* Center crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className={`w-8 h-8 border rounded-full ${
              isInRestrictedZone ? 'border-[#FF8C00]/50' : 'border-cyan/50'
            }`} />
            <div className={`absolute top-1/2 left-0 w-3 h-px ${isInRestrictedZone ? 'bg-[#FF8C00]/50' : 'bg-cyan/50'}`} />
            <div className={`absolute top-1/2 right-0 w-3 h-px translate-x-full ${isInRestrictedZone ? 'bg-[#FF8C00]/50' : 'bg-cyan/50'}`} />
            <div className={`absolute left-1/2 top-0 w-px h-3 -translate-y-full ${isInRestrictedZone ? 'bg-[#FF8C00]/50' : 'bg-cyan/50'}`} />
            <div className={`absolute left-1/2 bottom-0 w-px h-3 translate-y-full ${isInRestrictedZone ? 'bg-[#FF8C00]/50' : 'bg-cyan/50'}`} />
          </div>

          {/* PENDING VERIFICATION overlay */}
          <AnimatePresence>
            {isIncidentWorker && isPendingVerification && (
              <motion.div
                className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-ember/20 border border-ember/50 rounded"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [1, 0.7, 1], scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ opacity: { duration: 1, repeat: Infinity } }}
              >
                <AlertTriangle className="w-3 h-3 text-ember" />
                <span className="text-[8px] font-mono text-ember font-bold">PENDING VERIFICATION</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* VERIFIED overlay */}
          <AnimatePresence>
            {isIncidentWorker && isVerified && (
              <motion.div
                className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-danger/20 border border-danger/50 rounded"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <CheckCircle className="w-3 h-3 text-danger" />
                <span className="text-[8px] font-mono text-danger font-bold">VERIFIED EMERGENCY</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FALSE ALARM overlay */}
          <AnimatePresence>
            {isIncidentWorker && isFalseAlarm && (
              <motion.div
                className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-muted/20 border border-muted/50 rounded"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <XCircle className="w-3 h-3 text-muted-foreground" />
                <span className="text-[8px] font-mono text-muted-foreground font-bold">FALSE ALARM</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TARGET LOCKED overlay (when not in verification mode) */}
          <AnimatePresence>
            {isTracking && !isIncidentWorker && (
              <motion.div
                className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-cyan/20 border border-cyan/50 rounded"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Lock className="w-3 h-3 text-cyan" />
                <span className="text-[8px] font-mono text-cyan font-bold">TARGET LOCKED</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SIGNAL ACQUIRED overlay - shows when zoom completes */}
          <AnimatePresence>
            {signalAcquired && (
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 px-4 py-3 bg-cyan/20 border-2 border-cyan rounded-lg"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Signal className="w-6 h-6 text-cyan" />
                </motion.div>
                <span className="text-xs font-mono text-cyan font-bold tracking-wider">SIGNAL ACQUIRED</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tracked worker detection box */}
          {displayWorker && (
            <motion.div
              className={`absolute border-2 ${
                isInRestrictedZone ? 'border-[#FF8C00]' : 
                displayWorker.status === "danger" ? 'border-danger' :
                displayWorker.status === "warning" ? 'border-ember' : 'border-cyan'
              }`}
              style={{
                left: "40%",
                top: "30%",
                width: "20%",
                height: "40%",
              }}
              animate={{ 
                opacity: [1, 0.5, 1],
                boxShadow: isInRestrictedZone 
                  ? ["0 0 10px rgba(255,140,0,0.5)", "0 0 20px rgba(255,140,0,0.8)", "0 0 10px rgba(255,140,0,0.5)"]
                  : isTracking
                    ? ["0 0 10px rgba(0,242,255,0.5)", "0 0 20px rgba(0,242,255,0.8)", "0 0 10px rgba(0,242,255,0.5)"]
                    : undefined
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {/* Target corners */}
              <div className={`absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 ${
                isInRestrictedZone ? 'border-[#FF8C00]' : 'border-cyan'
              }`} />
              <div className={`absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 ${
                isInRestrictedZone ? 'border-[#FF8C00]' : 'border-cyan'
              }`} />
              <div className={`absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 ${
                isInRestrictedZone ? 'border-[#FF8C00]' : 'border-cyan'
              }`} />
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 ${
                isInRestrictedZone ? 'border-[#FF8C00]' : 'border-cyan'
              }`} />

              <span className={`absolute -top-5 left-0 text-[8px] font-mono font-bold ${
                isInRestrictedZone ? 'text-[#FF8C00]' :
                displayWorker.status === "danger" ? 'text-danger' :
                displayWorker.status === "warning" ? 'text-ember' : 'text-cyan'
              }`}>
                <Target className="w-3 h-3 inline mr-1" />
                {displayWorker.id}
              </span>
              
              {/* Biometric overlay */}
              <div className="absolute -bottom-8 left-0 text-[7px] font-mono space-y-0.5">
                <p className={displayWorker.hrElevated ? 'text-ember' : 'text-cyan/70'}>
                  HR: {displayWorker.heartRate} BPM
                </p>
                <p className="text-cyan/70">O2: {displayWorker.oxygenLevel}%</p>
              </div>
            </motion.div>
          )}

          {/* Zone breach warning overlay */}
          {isInRestrictedZone && (
            <motion.div
              className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#FF8C00]/20 border border-[#FF8C00]/50 rounded"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <span className="text-[8px] font-mono text-[#FF8C00]">⚠ ZONE BREACH</span>
            </motion.div>
          )}
        </div>

        {/* Scanline effect */}
        <div
          className={`absolute left-0 right-0 h-px pointer-events-none ${
            isInRestrictedZone ? 'bg-[#FF8C00]/30' : 'bg-cyan/30'
          }`}
          style={{ top: `${scanlinePos}%` }}
        />

        {/* Corner brackets */}
        <div className={`absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 ${
          isInRestrictedZone ? 'border-[#FF8C00]/50' : 'border-cyan/50'
        }`} />
        <div className={`absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 ${
          isInRestrictedZone ? 'border-[#FF8C00]/50' : 'border-cyan/50'
        }`} />
        <div className={`absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 ${
          isInRestrictedZone ? 'border-[#FF8C00]/50' : 'border-cyan/50'
        }`} />
        <div className={`absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 ${
          isInRestrictedZone ? 'border-[#FF8C00]/50' : 'border-cyan/50'
        }`} />

        {/* Timestamp with worker coords */}
        <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono ${
          isInRestrictedZone ? 'text-[#FF8C00]/70' : 'text-cyan/70'
        }`}>
          CAM-{String(currentCam + 1).padStart(2, "0")} | [{displayWorker?.position.x.toFixed(1)}, {displayWorker?.position.y.toFixed(1)}]
        </div>
      </div>

      {/* Verification buttons - shown when incident is pending */}
      <AnimatePresence>
        {isIncidentWorker && isPendingVerification && (
          <motion.div
            className="flex gap-2 mt-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <motion.button
              onClick={verifyIncident}
              className="flex-1 hud-button flex items-center justify-center gap-1.5 px-3 py-2 rounded border border-danger/50 bg-danger/10 text-danger text-[10px] font-mono font-bold hover:bg-danger/20 hover:border-danger hover:shadow-[0_0_10px_rgba(255,0,0,0.3)] transition-all active:scale-95"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              <CheckCircle className="w-3 h-3" />
              CONFIRM INCIDENT
            </motion.button>
            <motion.button
              onClick={markFalseAlarm}
              className="flex-1 hud-button flex items-center justify-center gap-1.5 px-3 py-2 rounded border border-muted/50 bg-muted/10 text-muted-foreground text-[10px] font-mono font-bold hover:bg-muted/20 hover:border-muted transition-all active:scale-95"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              <XCircle className="w-3 h-3" />
              FALSE ALARM
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Worker/Camera selector */}
      <div className={`flex gap-2 ${isIncidentWorker && isPendingVerification ? '' : 'mt-3'}`}>
        {workers.slice(0, 5).map((worker, i) => (
          <button
            key={worker.id}
            onClick={() => handleCamSelect(i)}
            className={`hud-button px-2 py-1 text-[9px] font-mono border transition-all flex items-center gap-1 active:scale-95 ${
              i === currentCam 
                ? worker.inRestrictedZone 
                  ? "border-[#FF8C00] text-[#FF8C00] bg-[#FF8C00]/10 shadow-[0_0_10px_rgba(255,140,0,0.3)]"
                  : "border-cyan text-cyan bg-cyan/10 shadow-[0_0_10px_rgba(0,242,255,0.3)]"
                : worker.status === "danger" 
                  ? "border-danger/50 text-danger hover:border-danger hover:shadow-[0_0_10px_rgba(255,0,0,0.3)]"
                  : worker.status === "warning"
                    ? "border-ember/50 text-ember hover:border-ember hover:shadow-[0_0_10px_rgba(255,191,0,0.3)]"
                    : "border-muted text-muted-foreground hover:border-cyan/50 hover:shadow-[0_0_10px_rgba(0,242,255,0.2)]"
            }`}
          >
            <User className="w-2.5 h-2.5" />
            {worker.id.replace("W-", "")}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default LiveStreamPanel;
