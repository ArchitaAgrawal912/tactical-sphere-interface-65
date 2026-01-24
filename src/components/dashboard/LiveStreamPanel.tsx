import { motion } from "framer-motion";
import { Camera, Circle, Maximize2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";

const LiveStreamPanel = () => {
  const [scanlinePos, setScanlinePos] = useState(0);
  const { workers, trackedWorkerId, setTrackedWorkerId, focusedWorkerId } = useSimulationStore();
  
  // Get tracked worker or default to first worker
  const trackedWorker = workers.find(w => w.id === trackedWorkerId) || workers[0];
  const [currentCam, setCurrentCam] = useState(0);

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

  const handleCamSelect = (index: number) => {
    setCurrentCam(index);
    setTrackedWorkerId(workers[index]?.id || null);
  };

  const displayWorker = workers[currentCam] || workers[0];
  const isInDanger = displayWorker?.status === "danger" || displayWorker?.status === "warning";
  const isInRestrictedZone = displayWorker?.inRestrictedZone;

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

          {/* Tracked worker detection box */}
          {displayWorker && (
            <motion.div
              className={`absolute border ${
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
                  : undefined
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span className={`absolute -top-4 left-0 text-[8px] font-mono ${
                isInRestrictedZone ? 'text-[#FF8C00]' :
                displayWorker.status === "danger" ? 'text-danger' :
                displayWorker.status === "warning" ? 'text-ember' : 'text-cyan'
              }`}>
                {displayWorker.id}
              </span>
              
              {/* Biometric overlay */}
              <div className="absolute -bottom-6 left-0 text-[7px] font-mono space-y-0.5">
                <p className={displayWorker.hrElevated ? 'text-ember' : 'text-cyan/70'}>
                  HR: {displayWorker.heartRate}
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

      {/* Worker/Camera selector */}
      <div className="flex gap-2 mt-3">
        {workers.slice(0, 5).map((worker, i) => (
          <button
            key={worker.id}
            onClick={() => handleCamSelect(i)}
            className={`px-2 py-1 text-[9px] font-mono border transition-colors flex items-center gap-1 ${
              i === currentCam 
                ? worker.inRestrictedZone 
                  ? "border-[#FF8C00] text-[#FF8C00] bg-[#FF8C00]/10"
                  : "border-cyan text-cyan bg-cyan/10"
                : worker.status === "danger" 
                  ? "border-danger/50 text-danger hover:border-danger"
                  : worker.status === "warning"
                    ? "border-ember/50 text-ember hover:border-ember"
                    : "border-muted text-muted-foreground hover:border-cyan/50"
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
