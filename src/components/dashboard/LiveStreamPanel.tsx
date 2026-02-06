import { motion, AnimatePresence } from "framer-motion";
import { Camera, Circle, Maximize2, User, Target, Lock, Signal, AlertTriangle, CheckCircle, XCircle, Minimize2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import FullScreenFeed from "./FullScreenFeed";

const LiveStreamPanel = () => {
  const [scanlinePos, setScanlinePos] = useState(0);
  const [signalAcquired, setSignalAcquired] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
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
    criticalWorkerIds,
    cycleToNextCritical,
    isSiteWideEmergency,
  } = useSimulationStore();
  
  // Get tracked worker or default to first worker
  const trackedWorker = workers.find(w => w.id === trackedWorkerId) || workers[0];
  const [currentCam, setCurrentCam] = useState(0);
  const isTracking = !!trackedWorkerId;

  // Check if we're in verification mode
  const isPendingVerification = activeProtocol?.verificationStatus === "pending";
  const isVerified = activeProtocol?.verificationStatus === "verified";
  const isFalseAlarm = activeProtocol?.verificationStatus === "false_alarm";
  
  // Auto-cycle through critical workers when in site-wide emergency
  useEffect(() => {
    if (isSiteWideEmergency && criticalWorkerIds.length > 1) {
      const cycleInterval = setInterval(() => {
        cycleToNextCritical();
      }, 3000); // Cycle every 3 seconds
      
      return () => clearInterval(cycleInterval);
    }
  }, [isSiteWideEmergency, criticalWorkerIds.length, cycleToNextCritical]);

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
      const timer = setTimeout(() => {
        setSignalAcquired(true);
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
      setZoomLevel(1.25);
      setTimeout(() => setIsWarping(false), 800);
      setTimeout(() => setZoomLevel(1), 10000);
    }
  };

  const displayWorker = workers[currentCam] || workers[0];
  const isInDanger = displayWorker?.status === "danger" || displayWorker?.status === "warning";
  const isInRestrictedZone = displayWorker?.inRestrictedZone;
  const isIncidentWorker = activeIncident?.workerId === displayWorker?.id;

  return (
    <>
      {/* Full screen modal */}
      <AnimatePresence>
        {isFullScreen && (
          <FullScreenFeed onClose={() => setIsFullScreen(false)} />
        )}
      </AnimatePresence>

      <motion.div
        className="p-4 w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live Feed</span>
            {/* Multi-target cycling indicator */}
            {isSiteWideEmergency && criticalWorkerIds.length > 1 && (
              <motion.div
                className="flex items-center gap-1 px-1.5 py-0.5 bg-danger/20 border border-danger/50 rounded"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <span className="text-[7px] font-mono text-danger font-bold">
                  CYCLING {criticalWorkerIds.length}
                </span>
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-2 h-2 fill-danger text-danger animate-pulse" />
            <span className="text-[8px] font-mono text-danger">REC</span>
            <button 
              onClick={() => setIsFullScreen(true)}
              className="p-1 hover:bg-cyan/10 rounded transition-colors"
            >
              <Maximize2 className="w-3 h-3 text-muted-foreground hover:text-cyan transition-colors cursor-pointer" />
            </button>
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
            <div className="absolute inset-3 border border-cyan/10 rounded">
              {/* Grid overlay */}
              <svg className="absolute inset-0 w-full h-full opacity-30">
                <pattern id="camGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                  <path d="M 16 0 L 0 0 0 16" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-cyan" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#camGrid)" />
              </svg>
            </div>

            {/* Center crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className={`w-6 h-6 border rounded-full ${
                isInRestrictedZone ? 'border-[#FF8C00]/50' : 'border-cyan/50'
              }`} />
              <div className={`absolute top-1/2 left-0 w-2 h-px ${isInRestrictedZone ? 'bg-[#FF8C00]/50' : 'bg-cyan/50'}`} />
              <div className={`absolute top-1/2 right-0 w-2 h-px translate-x-full ${isInRestrictedZone ? 'bg-[#FF8C00]/50' : 'bg-cyan/50'}`} />
              <div className={`absolute left-1/2 top-0 w-px h-2 -translate-y-full ${isInRestrictedZone ? 'bg-[#FF8C00]/50' : 'bg-cyan/50'}`} />
              <div className={`absolute left-1/2 bottom-0 w-px h-2 translate-y-full ${isInRestrictedZone ? 'bg-[#FF8C00]/50' : 'bg-cyan/50'}`} />
            </div>

            {/* PENDING VERIFICATION overlay */}
            <AnimatePresence>
              {isIncidentWorker && isPendingVerification && (
                <motion.div
                  className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 bg-ember/20 border border-ember/50 rounded"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [1, 0.7, 1], scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ opacity: { duration: 1, repeat: Infinity } }}
                >
                  <AlertTriangle className="w-2.5 h-2.5 text-ember" />
                  <span className="text-[7px] font-mono text-ember font-bold">PENDING</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* VERIFIED overlay */}
            <AnimatePresence>
              {isIncidentWorker && isVerified && (
                <motion.div
                  className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 bg-danger/20 border border-danger/50 rounded"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <CheckCircle className="w-2.5 h-2.5 text-danger" />
                  <span className="text-[7px] font-mono text-danger font-bold">VERIFIED</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FALSE ALARM overlay */}
            <AnimatePresence>
              {isIncidentWorker && isFalseAlarm && (
                <motion.div
                  className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 bg-muted/20 border border-muted/50 rounded"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <XCircle className="w-2.5 h-2.5 text-muted-foreground" />
                  <span className="text-[7px] font-mono text-muted-foreground font-bold">FALSE</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TARGET LOCKED overlay (when not in verification mode) */}
            <AnimatePresence>
              {isTracking && !isIncidentWorker && (
                <motion.div
                  className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 bg-cyan/20 border border-cyan/50 rounded"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Lock className="w-2.5 h-2.5 text-cyan" />
                  <span className="text-[7px] font-mono text-cyan font-bold">LOCKED</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SIGNAL ACQUIRED overlay */}
            <AnimatePresence>
              {signalAcquired && (
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 px-3 py-2 bg-cyan/20 border-2 border-cyan rounded-lg"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Signal className="w-4 h-4 text-cyan" />
                  </motion.div>
                  <span className="text-[8px] font-mono text-cyan font-bold tracking-wider">ACQUIRED</span>
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
                    ? ["0 0 8px rgba(255,140,0,0.5)", "0 0 16px rgba(255,140,0,0.8)", "0 0 8px rgba(255,140,0,0.5)"]
                    : isTracking
                      ? ["0 0 8px rgba(0,242,255,0.5)", "0 0 16px rgba(0,242,255,0.8)", "0 0 8px rgba(0,242,255,0.5)"]
                      : undefined
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {/* Target corners */}
                <div className={`absolute -top-0.5 -left-0.5 w-2 h-2 border-t border-l ${
                  isInRestrictedZone ? 'border-[#FF8C00]' : 'border-cyan'
                }`} />
                <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 border-t border-r ${
                  isInRestrictedZone ? 'border-[#FF8C00]' : 'border-cyan'
                }`} />
                <div className={`absolute -bottom-0.5 -left-0.5 w-2 h-2 border-b border-l ${
                  isInRestrictedZone ? 'border-[#FF8C00]' : 'border-cyan'
                }`} />
                <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b border-r ${
                  isInRestrictedZone ? 'border-[#FF8C00]' : 'border-cyan'
                }`} />

                <span className={`absolute -top-4 left-0 text-[7px] font-mono font-bold ${
                  isInRestrictedZone ? 'text-[#FF8C00]' :
                  displayWorker.status === "danger" ? 'text-danger' :
                  displayWorker.status === "warning" ? 'text-ember' : 'text-cyan'
                }`}>
                  <Target className="w-2 h-2 inline mr-0.5" />
                  {displayWorker.id}
                </span>
                
                {/* Biometric overlay */}
                <div className="absolute -bottom-6 left-0 text-[6px] font-mono space-y-0.5">
                  <p className={displayWorker.hrElevated ? 'text-ember' : 'text-cyan/70'}>
                    {displayWorker.heartRate} BPM
                  </p>
                </div>
              </motion.div>
            )}

            {/* Zone breach warning overlay */}
            {isInRestrictedZone && (
              <motion.div
                className="absolute top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-[#FF8C00]/20 border border-[#FF8C00]/50 rounded"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <span className="text-[7px] font-mono text-[#FF8C00]">⚠ BREACH</span>
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
          <div className={`absolute top-1.5 left-1.5 w-3 h-3 border-l border-t ${
            isInRestrictedZone ? 'border-[#FF8C00]/50' : 'border-cyan/50'
          }`} />
          <div className={`absolute top-1.5 right-1.5 w-3 h-3 border-r border-t ${
            isInRestrictedZone ? 'border-[#FF8C00]/50' : 'border-cyan/50'
          }`} />
          <div className={`absolute bottom-1.5 left-1.5 w-3 h-3 border-l border-b ${
            isInRestrictedZone ? 'border-[#FF8C00]/50' : 'border-cyan/50'
          }`} />
          <div className={`absolute bottom-1.5 right-1.5 w-3 h-3 border-r border-b ${
            isInRestrictedZone ? 'border-[#FF8C00]/50' : 'border-cyan/50'
          }`} />

          {/* Timestamp with worker coords */}
          <div className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[8px] font-mono ${
            isInRestrictedZone ? 'text-[#FF8C00]/70' : 'text-cyan/70'
          }`}>
            CAM-{String(currentCam + 1).padStart(2, "0")}
          </div>
        </div>

        {/* Verification buttons - shown when incident is pending */}
        <AnimatePresence>
          {isIncidentWorker && isPendingVerification && (
            <motion.div
              className="flex gap-2 mt-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <motion.button
                onClick={verifyIncident}
                className="flex-1 hud-button flex items-center justify-center gap-1 px-2 py-1.5 rounded border border-danger/50 bg-danger/10 text-danger text-[9px] font-mono font-bold hover:bg-danger/20 hover:border-danger hover:shadow-[0_0_10px_rgba(255,0,0,0.3)] transition-all active:scale-95"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <CheckCircle className="w-3 h-3" />
                CONFIRM
              </motion.button>
              <motion.button
                onClick={markFalseAlarm}
                className="flex-1 hud-button flex items-center justify-center gap-1 px-2 py-1.5 rounded border border-muted/50 bg-muted/10 text-muted-foreground text-[9px] font-mono font-bold hover:bg-muted/20 hover:border-muted transition-all active:scale-95"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <XCircle className="w-3 h-3" />
                FALSE
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Worker/Camera selector */}
        <div className={`flex gap-1.5 ${isIncidentWorker && isPendingVerification ? '' : 'mt-2'}`}>
          {workers.slice(0, 5).map((worker, i) => (
            <button
              key={worker.id}
              onClick={() => handleCamSelect(i)}
              className={`hud-button px-1.5 py-1 text-[8px] font-mono border transition-all flex items-center gap-0.5 active:scale-95 ${
                i === currentCam 
                  ? worker.inRestrictedZone 
                    ? "border-[#FF8C00] text-[#FF8C00] bg-[#FF8C00]/10 shadow-[0_0_8px_rgba(255,140,0,0.3)]"
                    : "border-cyan text-cyan bg-cyan/10 shadow-[0_0_8px_rgba(0,242,255,0.3)]"
                  : worker.status === "danger" 
                    ? "border-danger/50 text-danger hover:border-danger"
                    : worker.status === "warning"
                      ? "border-ember/50 text-ember hover:border-ember"
                      : "border-muted text-muted-foreground hover:border-cyan/50"
              }`}
            >
              <User className="w-2 h-2" />
              {worker.id.replace("W-", "")}
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
};

export default LiveStreamPanel;
