import { motion, AnimatePresence } from "framer-motion";
import { useSimulationStore } from "@/store/simulationStore";
import { WorkerTelemetry } from "@/utils/simEngine";
import { RotateCcw } from "lucide-react";
import { useState, useRef, useCallback, useMemo } from "react";

// Calculate Euclidean distance between two positions
const calculateDistance = (pos1: { x: number; y: number }, pos2: { x: number; y: number }) => {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
};

// Calculate ETA based on distance (simulated: 1 unit = ~3 seconds)
const calculateETA = (distance: number) => {
  const seconds = Math.round(distance * 3);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

const HexGrid = () => {
  const { 
    workers, 
    focusedWorkerId, 
    setFocusedWorkerId,
    isWarping,
    zoomLevel,
    setZoomLevel,
    activeIncident,
    setIsWarping,
    setTrackedWorkerId,
    showWorkers,
    highlightedPPEType,
    recenterMap,
    sonarPulseActive,
    activeProtocol,
    isSiteWideEmergency,
    affectedWorkerIds,
    activeDangerZone,
  } = useSimulationStore();

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate nearest responders for critical/warning workers
  const nearestResponders = useMemo(() => {
    const criticalWorker = workers.find(w => 
      w.status === "danger" || w.status === "warning" || 
      activeIncident?.workerId === w.id ||
      activeProtocol?.workerId === w.id
    );

    if (!criticalWorker) return null;

    const otherWorkers = workers
      .filter(w => w.id !== criticalWorker.id && w.status === "safe")
      .map(w => ({
        worker: w,
        distance: calculateDistance(criticalWorker.position, w.position),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2);

    return {
      victim: criticalWorker,
      responders: otherWorkers.map((r, idx) => ({
        ...r,
        eta: calculateETA(r.distance),
        label: `RESPONDER ${idx + 1}`,
      })),
    };
  }, [workers, activeIncident, activeProtocol]);

  const getStatusColor = (worker: WorkerTelemetry) => {
    if (worker.inRestrictedZone) return "bg-amber";
    switch (worker.status) {
      case "safe": return "bg-primary";
      case "warning": return "bg-amber";
      case "danger": return "bg-destructive";
    }
  };

  const isPPEHighlighted = (worker: WorkerTelemetry) => {
    if (!highlightedPPEType) return false;
    const threshold = highlightedPPEType === "helmet" ? 90 : highlightedPPEType === "vest" ? 80 : 70;
    return worker.ppe < threshold;
  };

  const handleWorkerClick = (worker: WorkerTelemetry) => {
    if (isDragging) return;
    
    const isFocused = focusedWorkerId === worker.id;
    if (isFocused) {
      handleRecenter();
    } else {
      setIsWarping(true);
      setZoomLevel(1.15);
      setFocusedWorkerId(worker.id);
      setTrackedWorkerId(worker.id);
      setDragOffset({ x: 0, y: 0 });
      setTimeout(() => setIsWarping(false), 600);
      setTimeout(() => setZoomLevel(1), 8000);
    }
  };

  const handleRecenter = useCallback(() => {
    setDragOffset({ x: 0, y: 0 });
    recenterMap();
  }, [recenterMap]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.6, Math.min(2, zoomLevel + delta));
    setZoomLevel(newZoom);
  }, [zoomLevel, setZoomLevel]);

  const focusedWorker = workers.find(w => w.id === focusedWorkerId);

  const getCameraOffset = () => {
    if (!focusedWorker) return { x: dragOffset.x, y: dragOffset.y };
    const rawOffsetX = (50 - focusedWorker.position.x) * 1.2 + dragOffset.x;
    const rawOffsetY = (50 - focusedWorker.position.y) * 1.2 + dragOffset.y;
    const maxOffset = 50;
    return {
      x: Math.max(-maxOffset, Math.min(maxOffset, rawOffsetX)),
      y: Math.max(-maxOffset, Math.min(maxOffset, rawOffsetY)),
    };
  };

  const cameraOffset = getCameraOffset();

  return (
    <motion.div 
      ref={containerRef}
      className={`relative w-full aspect-square mx-auto overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      drag
      dragConstraints={{ left: -150, right: 150, top: -150, bottom: 150 }}
      dragElastic={0.1}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false);
        const newX = Math.max(-50, Math.min(50, dragOffset.x + info.offset.x / 5));
        const newY = Math.max(-50, Math.min(50, dragOffset.y + info.offset.y / 5));
        setDragOffset({ x: newX, y: newY });
      }}
      onWheel={handleWheel}
      animate={{
        scale: zoomLevel,
        x: `${cameraOffset.x}%`,
        y: `${cameraOffset.y}%`,
      }}
      transition={{ 
        type: "spring", 
        stiffness: 100, 
        damping: 20,
      }}
    >
      {/* Minimal outer ring */}
      <div className="absolute inset-0 rounded-full border border-border" />
      <div className="absolute inset-4 rounded-full border border-border/50" />
      <div className="absolute inset-8 rounded-full border border-border/30" />
      <div className="absolute inset-16 rounded-full border border-border/20" />

      {/* Simplified hex grid pattern - very subtle */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 100 100">
        <defs>
          <pattern id="hexPattern" width="10" height="17.32" patternUnits="userSpaceOnUse">
            <polygon 
              points="5,0 10,2.89 10,8.66 5,11.55 0,8.66 0,2.89" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.3"
              className="text-primary"
            />
          </pattern>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#hexPattern)" />
      </svg>

      {/* Restricted zones - clean styling */}
      <div 
        className="absolute rounded-full border border-destructive/20 bg-destructive/5"
        style={{ left: "5%", top: "5%", width: "28%", height: "28%" }}
      >
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-mono text-destructive/40 uppercase tracking-widest">
          Restricted
        </span>
      </div>
      <div 
        className="absolute rounded-full border border-destructive/20 bg-destructive/5"
        style={{ right: "5%", bottom: "10%", width: "22%", height: "22%" }}
      >
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-mono text-destructive/40 uppercase tracking-widest">
          Restricted
        </span>
      </div>

      {/* Grid crosshairs */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.1]" viewBox="0 0 100 100">
        <line x1="50" y1="2" x2="50" y2="98" stroke="currentColor" strokeWidth="0.3" className="text-primary" />
        <line x1="2" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="0.3" className="text-primary" />
        <line x1="15" y1="15" x2="85" y2="85" stroke="currentColor" strokeWidth="0.2" className="text-primary" />
        <line x1="85" y1="15" x2="15" y2="85" stroke="currentColor" strokeWidth="0.2" className="text-primary" />
      </svg>

      {/* Subtle sonar pulse */}
      <motion.div
        className="absolute inset-0 rounded-full border border-primary/20"
        animate={{ scale: [0.2, 1], opacity: [0.4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeOut" }}
      />

      {/* SCAN pulse when triggered */}
      <AnimatePresence>
        {sonarPulseActive && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary"
            initial={{ scale: 0.2, opacity: 1 }}
            animate={{ scale: 1.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          />
        )}
      </AnimatePresence>

      {/* Rotating scan line - subtle */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      >
        <div 
          className="absolute top-1/2 left-1/2 w-1/2 h-px origin-left opacity-30"
          style={{ background: "linear-gradient(90deg, hsl(var(--primary)), transparent)" }}
        />
      </motion.div>

      {/* Center point */}
      <button 
        onClick={handleRecenter}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
      >
        <motion.div
          className="w-3 h-3 rounded-full bg-primary group-hover:scale-150 transition-transform"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <RotateCcw className="w-3 h-3 text-primary" />
        </motion.div>
      </button>

      {/* Danger Zone Geofence */}
      <AnimatePresence>
        {activeDangerZone && isSiteWideEmergency && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: `${activeDangerZone.x}%`,
              top: `${activeDangerZone.y}%`,
              width: `${activeDangerZone.radius * 2}%`,
              height: `${activeDangerZone.radius * 2}%`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-destructive/50 bg-destructive/10"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-1 bg-destructive/20 border border-destructive/50 rounded"
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <span className="text-[8px] font-mono text-destructive uppercase tracking-widest">Hazard</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEAREST RESPONDER SAFETY LINES */}
      {nearestResponders && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {nearestResponders.responders.map((responder, idx) => (
            <g key={responder.worker.id}>
              {/* Dashed safety line */}
              <motion.line
                x1={`${nearestResponders.victim.position.x}%`}
                y1={`${nearestResponders.victim.position.y}%`}
                x2={`${responder.worker.position.x}%`}
                y2={`${responder.worker.position.y}%`}
                stroke={idx === 0 ? "hsl(var(--primary))" : "hsl(var(--amber))"}
                strokeWidth="1.5"
                strokeDasharray="6 4"
                strokeOpacity="0.6"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 0.8, delay: idx * 0.2 }}
              />
              {/* Animated pulse along line */}
              <motion.circle
                r="3"
                fill={idx === 0 ? "hsl(var(--primary))" : "hsl(var(--amber))"}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  cx: [
                    `${nearestResponders.victim.position.x}%`,
                    `${responder.worker.position.x}%`,
                  ],
                  cy: [
                    `${nearestResponders.victim.position.y}%`,
                    `${responder.worker.position.y}%`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
              />
            </g>
          ))}
        </svg>
      )}

      {/* Worker nodes */}
      <AnimatePresence>
        {showWorkers && workers.map((worker, index) => {
          const isFocused = focusedWorkerId === worker.id;
          const hasActiveIncident = activeIncident?.workerId === worker.id;
          const hasActiveProtocol = activeProtocol?.workerId === worker.id;
          const isInProtocol = hasActiveIncident || hasActiveProtocol;
          const isPPEFailing = isPPEHighlighted(worker);
          const isAtRisk = isSiteWideEmergency && affectedWorkerIds.includes(worker.id);
          
          // Check if this worker is a responder
          const responderInfo = nearestResponders?.responders.find(r => r.worker.id === worker.id);

          return (
            <motion.div
              key={worker.id}
              className="absolute cursor-pointer"
              initial={{ 
                left: `${worker.position.x}%`,
                top: `${worker.position.y}%`,
                scale: 0, 
                opacity: 0 
              }}
              animate={{ 
                left: `${worker.position.x}%`,
                top: `${worker.position.y}%`,
                scale: 1,
                opacity: 1,
                x: "-50%",
                y: "-50%"
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                left: { type: "spring", stiffness: 60, damping: 15 },
                top: { type: "spring", stiffness: 60, damping: 15 },
                scale: { delay: index * 0.05 },
              }}
              onClick={() => handleWorkerClick(worker)}
            >
              {/* Responder badge */}
              <AnimatePresence>
                {responderInfo && (
                  <motion.div
                    className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-20"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                  >
                    <div className={`px-2 py-1 rounded border ${
                      responderInfo.label === "RESPONDER 1" 
                        ? "bg-primary/10 border-primary/30" 
                        : "bg-amber/10 border-amber/30"
                    }`}>
                      <p className={`text-[8px] font-mono uppercase tracking-widest ${
                        responderInfo.label === "RESPONDER 1" ? "text-primary" : "text-amber"
                      }`}>
                        {responderInfo.label}
                      </p>
                      <p className={`text-[10px] font-mono font-semibold ${
                        responderInfo.label === "RESPONDER 1" ? "text-primary" : "text-amber"
                      }`}>
                        ETA: {responderInfo.eta}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* At risk pulsing ring */}
              <AnimatePresence>
                {isAtRisk && !isFocused && (
                  <motion.div
                    className="absolute -inset-4"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0.2, 0.8] }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <div className="w-full h-full rounded-full border-2 border-destructive" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Focus selection ring */}
              <AnimatePresence>
                {isFocused && (
                  <motion.div
                    className="absolute -inset-5 pointer-events-none"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full border border-primary"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Protocol/incident ring */}
              <AnimatePresence>
                {isInProtocol && (
                  <motion.div
                    className="absolute -inset-3"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <motion.div
                      className="w-full h-full rounded-full border-2 border-amber"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Worker node dot */}
              <motion.div
                className={`rounded-full ${isPPEFailing ? 'bg-amber' : getStatusColor(worker)}`}
                style={{
                  width: isFocused ? "16px" : "12px",
                  height: isFocused ? "16px" : "12px",
                }}
                animate={isInProtocol ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1.5, repeat: isInProtocol ? Infinity : 0 }}
                whileHover={{ scale: 1.4 }}
              />

              {/* Worker ID label */}
              <motion.div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: isFocused ? 1 : 0.6 }}
              >
                <span className={`text-[8px] font-mono uppercase tracking-wider ${
                  isPPEFailing || worker.inRestrictedZone ? 'text-amber' :
                  isInProtocol ? 'text-amber' : 'text-primary'
                }`}>
                  {worker.id}
                </span>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Focused worker data card - cleaner styling */}
      <AnimatePresence>
        {focusedWorkerId && focusedWorker && (
          <motion.div
            className="absolute z-20 p-4 min-w-[200px] rounded-lg border border-border bg-card/95 backdrop-blur-sm"
            style={{
              left: `${Math.min(Math.max(focusedWorker.position.x, 25), 75)}%`,
              top: `${focusedWorker.position.y > 50 ? focusedWorker.position.y - 30 : focusedWorker.position.y + 20}%`,
            }}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(focusedWorker)}`} />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{focusedWorker.id}</span>
              <span className={`ml-auto text-[10px] font-mono uppercase tracking-widest ${
                focusedWorker.status === "safe" ? "text-primary" :
                focusedWorker.status === "warning" ? "text-amber" : "text-destructive"
              }`}>
                {focusedWorker.status}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground">{focusedWorker.name}</p>
            
            {focusedWorker.inRestrictedZone && (
              <motion.div 
                className="mt-2 px-2 py-1 bg-amber/10 border border-amber/30 rounded text-[10px] text-amber font-mono uppercase tracking-wider"
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                ⚠ Zone Breach
              </motion.div>
            )}
            
            <div className="mt-3 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Zone</span>
                <span className={focusedWorker.inRestrictedZone ? 'text-amber' : 'text-foreground'}>
                  {focusedWorker.zone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground uppercase tracking-wider text-[10px]">PPE</span>
                <span className={focusedWorker.ppe >= 90 ? 'text-primary' : focusedWorker.ppe >= 70 ? 'text-amber' : 'text-destructive'}>
                  {focusedWorker.ppe}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Heart Rate</span>
                <span className={focusedWorker.hrElevated ? 'text-amber' : 'text-foreground'}>
                  {focusedWorker.heartRate} BPM
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Coords</span>
                <span className="text-muted-foreground">
                  [{focusedWorker.position.x.toFixed(1)}, {focusedWorker.position.y.toFixed(1)}]
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corner zone labels */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest">North</div>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest">South</div>
      <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest rotate-[-90deg]">W</div>
      <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest rotate-90">E</div>
    </motion.div>
  );
};

export default HexGrid;
