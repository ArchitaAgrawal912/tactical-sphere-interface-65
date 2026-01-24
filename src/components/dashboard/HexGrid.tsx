import { motion, AnimatePresence } from "framer-motion";
import { useSimulationStore } from "@/store/simulationStore";
import { WorkerTelemetry } from "@/utils/simEngine";
import { RotateCcw } from "lucide-react";
import { useState, useRef, useCallback } from "react";

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

  // Drag state for pan functionality
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getStatusColor = (worker: WorkerTelemetry) => {
    // Safety Orange (#FF8C00) for workers in restricted zones
    if (worker.inRestrictedZone) return "bg-[#FF8C00]";
    switch (worker.status) {
      case "safe": return "bg-cyan";
      case "warning": return "bg-ember";
      case "danger": return "bg-danger";
    }
  };

  const getStatusGlow = (worker: WorkerTelemetry, isFocused: boolean) => {
    const intensity = isFocused ? "30px" : "20px";
    if (worker.inRestrictedZone) {
      return `shadow-[0_0_${intensity}_rgba(255,140,0,0.9)]`;
    }
    // Amber ring for elevated HR
    if (worker.hrElevated) {
      return `shadow-[0_0_${intensity}_rgba(255,191,0,0.9)]`;
    }
    switch (worker.status) {
      case "safe": return `shadow-[0_0_${intensity}_rgba(0,242,255,0.9)]`;
      case "warning": return `shadow-[0_0_${intensity}_rgba(255,191,0,0.9)]`;
      case "danger": return `shadow-[0_0_${intensity}_rgba(255,0,0,0.9)]`;
    }
  };

  // Check if worker is failing PPE compliance for highlighted type
  const isPPEHighlighted = (worker: WorkerTelemetry) => {
    if (!highlightedPPEType) return false;
    // Simulate PPE type failures based on worker PPE score
    const threshold = highlightedPPEType === "helmet" ? 90 : highlightedPPEType === "vest" ? 80 : 70;
    return worker.ppe < threshold;
  };

  const handleWorkerClick = (worker: WorkerTelemetry) => {
    if (isDragging) return; // Don't trigger click during drag
    
    const isFocused = focusedWorkerId === worker.id;
    if (isFocused) {
      // Clicking focused worker recenters
      handleRecenter();
    } else {
      setIsWarping(true);
      setZoomLevel(1.25); // Gentle zoom to avoid clipping
      setFocusedWorkerId(worker.id);
      setTrackedWorkerId(worker.id);
      setDragOffset({ x: 0, y: 0 }); // Reset drag on focus
      setTimeout(() => setIsWarping(false), 800);
      // Auto-reset zoom after 10 seconds
      setTimeout(() => {
        setZoomLevel(1);
      }, 10000);
    }
  };

  const handleRecenter = useCallback(() => {
    setDragOffset({ x: 0, y: 0 });
    recenterMap();
  }, [recenterMap]);

  // Handle wheel zoom with constraints
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(2.5, zoomLevel + delta));
    setZoomLevel(newZoom);
  }, [zoomLevel, setZoomLevel]);

  const focusedWorker = workers.find(w => w.id === focusedWorkerId);

  // Calculate camera offset to center on focused worker with clamping to prevent black screen
  const getCameraOffset = () => {
    if (!focusedWorker) return { x: dragOffset.x, y: dragOffset.y };
    // Center the worker in viewport by calculating offset from center (50,50)
    // Clamp the offset to prevent the grid from going off-screen
    const rawOffsetX = (50 - focusedWorker.position.x) * 1.5 + dragOffset.x;
    const rawOffsetY = (50 - focusedWorker.position.y) * 1.5 + dragOffset.y;
    const maxOffset = 60; // Maximum offset percentage
    const offsetX = Math.max(-maxOffset, Math.min(maxOffset, rawOffsetX));
    const offsetY = Math.max(-maxOffset, Math.min(maxOffset, rawOffsetY));
    return { x: offsetX, y: offsetY };
  };

  const cameraOffset = getCameraOffset();

  return (
    <motion.div 
      ref={containerRef}
      className={`relative w-full aspect-square mx-auto overflow-visible ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      drag
      dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
      dragElastic={0.1}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false);
        // Apply drag offset with constraints
        const newX = Math.max(-60, Math.min(60, dragOffset.x + info.offset.x / 5));
        const newY = Math.max(-60, Math.min(60, dragOffset.y + info.offset.y / 5));
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
        stiffness: 80, 
        damping: 25,
        mass: 1,
      }}
    >
      {/* Warp effect overlay */}
      <AnimatePresence>
        {isWarping && (
          <motion.div
            className="absolute inset-0 z-30 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-gradient-radial from-cyan/20 via-transparent to-transparent animate-pulse" />
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-full h-0.5 origin-left"
                style={{ rotate: `${i * 45}deg` }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: [0, 1, 0] }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <div className="w-full h-full bg-gradient-to-r from-cyan via-cyan-glow to-transparent" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glow backdrop */}
      <div className="absolute inset-0 rounded-full bg-gradient-radial from-cyan/10 via-transparent to-transparent" />
      
      {/* Outer rings with glow */}
      <motion.div 
        className="absolute inset-0 rounded-full border-2 border-cyan/40"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        style={{ boxShadow: "0 0 30px rgba(0,242,255,0.2), inset 0 0 30px rgba(0,242,255,0.1)" }}
      />
      <motion.div 
        className="absolute inset-6 rounded-full border border-cyan/30"
        animate={{ rotate: -360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-12 rounded-full border border-cyan/20" />
      <div className="absolute inset-20 rounded-full border border-cyan/15" />
      <div className="absolute inset-28 rounded-full border border-cyan/10" />

      {/* Restricted zones visualization */}
      <div 
        className="absolute rounded-full border border-danger/30 bg-danger/5"
        style={{ 
          left: "5%", top: "5%", 
          width: "30%", height: "30%",
        }}
      >
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-mono text-danger/50 uppercase">
          Restricted
        </span>
      </div>
      <div 
        className="absolute rounded-full border border-danger/30 bg-danger/5"
        style={{ 
          right: "3%", bottom: "10%", 
          width: "24%", height: "24%",
        }}
      >
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-mono text-danger/50 uppercase">
          Restricted
        </span>
      </div>
      
      {/* Hex grid pattern overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 100">
        <defs>
          <pattern id="hexPattern" width="8" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
            <polygon 
              points="4,0 8,2.31 8,6.93 4,9.24 0,6.93 0,2.31" 
              fill="none" 
              stroke="url(#hexGradient)" 
              strokeWidth="0.3" 
            />
          </pattern>
          <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(0,242,255)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="rgb(0,242,255)" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#hexPattern)" />
      </svg>

      {/* Continuous sonar pulse */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-cyan"
        animate={{ scale: [0.1, 1], opacity: [0.8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
        style={{ boxShadow: "0 0 20px rgba(0,242,255,0.5)" }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border border-cyan/60"
        animate={{ scale: [0.1, 1], opacity: [0.6, 0] }}
        transition={{ duration: 4, delay: 1, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border border-cyan/40"
        animate={{ scale: [0.1, 1], opacity: [0.4, 0] }}
        transition={{ duration: 4, delay: 2, repeat: Infinity, ease: "easeOut" }}
      />

      {/* Manual SCAN pulse - triggered by command */}
      <AnimatePresence>
        {sonarPulseActive && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-cyan"
              initial={{ scale: 0.1, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ boxShadow: "0 0 40px rgba(0,242,255,0.8)" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-cyan"
              initial={{ scale: 0.1, opacity: 1 }}
              animate={{ scale: 1.3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
              style={{ boxShadow: "0 0 30px rgba(0,242,255,0.6)" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-cyan"
              initial={{ scale: 0.1, opacity: 1 }}
              animate={{ scale: 1.1, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              style={{ boxShadow: "0 0 20px rgba(0,242,255,0.4)" }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        <line x1="50" y1="2" x2="50" y2="98" stroke="url(#lineGradient)" strokeWidth="0.3" />
        <line x1="2" y1="50" x2="98" y2="50" stroke="url(#lineGradient)" strokeWidth="0.3" />
        <line x1="15" y1="15" x2="85" y2="85" stroke="url(#lineGradient)" strokeWidth="0.2" />
        <line x1="85" y1="15" x2="15" y2="85" stroke="url(#lineGradient)" strokeWidth="0.2" />
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(0,242,255)" stopOpacity="0" />
            <stop offset="50%" stopColor="rgb(0,242,255)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="rgb(0,242,255)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Rotating scan line */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <div 
          className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left"
          style={{
            background: "linear-gradient(90deg, rgba(0,242,255,0.8), transparent)",
            boxShadow: "0 0 10px rgba(0,242,255,0.5)"
          }}
        />
      </motion.div>

      {/* Center point - clickable to recenter */}
      <button 
        onClick={handleRecenter}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
      >
        <motion.div
          className="w-6 h-6 bg-cyan rounded-full group-hover:scale-125 transition-transform"
          animate={{ 
            scale: [1, 1.2, 1],
            boxShadow: [
              "0 0 20px rgba(0,242,255,0.5)",
              "0 0 40px rgba(0,242,255,0.8)",
              "0 0 20px rgba(0,242,255,0.5)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="absolute inset-0 w-6 h-6 bg-cyan/30 rounded-full animate-ping" />
        {/* Recenter icon on hover */}
        <motion.div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <RotateCcw className="w-3 h-3 text-cyan" />
        </motion.div>
      </button>

      {/* Danger Zone Geofence - Red Pulsing Circle */}
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
            {/* Outer pulsing ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-danger/60"
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.6, 0.3, 0.6],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ boxShadow: "0 0 30px rgba(255,0,0,0.4)" }}
            />
            {/* Inner danger zone */}
            <motion.div
              className="absolute inset-2 rounded-full border-2 border-danger bg-danger/10"
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(255,0,0,0.3), inset 0 0 20px rgba(255,0,0,0.1)",
                  "0 0 40px rgba(255,0,0,0.5), inset 0 0 30px rgba(255,0,0,0.2)",
                  "0 0 20px rgba(255,0,0,0.3), inset 0 0 20px rgba(255,0,0,0.1)"
                ]
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            {/* HAZARD label */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 bg-danger/30 border border-danger rounded"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <span className="text-[8px] font-mono text-danger font-bold uppercase">
                ⚠️ HAZARD ZONE
              </span>
            </motion.div>
            {/* Rotating danger markers */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              {[0, 60, 120, 180, 240, 300].map((angle) => (
                <motion.div
                  key={angle}
                  className="absolute w-2 h-2 bg-danger rounded-full"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: `rotate(${angle}deg) translateY(-${activeDangerZone.radius}%) translateX(-50%)`,
                  }}
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: angle / 360 }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Worker nodes with smooth gliding transitions */}
      <AnimatePresence>
        {showWorkers && workers.map((worker, index) => {
          const isFocused = focusedWorkerId === worker.id;
          const hasActiveIncident = activeIncident?.workerId === worker.id;
          const hasActiveProtocol = activeProtocol?.workerId === worker.id;
          const isInProtocol = hasActiveIncident || hasActiveProtocol;
          const isPPEFailing = isPPEHighlighted(worker);
          const isAtRisk = isSiteWideEmergency && affectedWorkerIds.includes(worker.id);

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
              exit={{
                scale: 0,
                opacity: 0,
              }}
              transition={{ 
                left: { type: "spring", stiffness: 50, damping: 15 },
                top: { type: "spring", stiffness: 50, damping: 15 },
                scale: { delay: index * 0.1 },
                opacity: { delay: index * 0.1 }
              }}
              onClick={() => handleWorkerClick(worker)}
            >
              {/* "AT RISK" pulsing red ring for site-wide emergency */}
              <AnimatePresence>
                {isAtRisk && !isFocused && (
                  <motion.div
                    className="absolute -inset-5"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    <div className="w-full h-full rounded-full border-3 border-danger" 
                         style={{ boxShadow: "0 0 20px rgba(255,0,0,0.8)" }} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* PPE violation highlight ring */}
              <AnimatePresence>
                {isPPEFailing && !isFocused && !isAtRisk && (
                  <motion.div
                    className="absolute -inset-4"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <div className="w-full h-full rounded-full border-2 border-[#FF8C00]" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Elevated HR amber ring pulse */}
              <AnimatePresence>
                {worker.hrElevated && !isFocused && !hasActiveIncident && !isPPEFailing && (
                  <motion.div
                    className="absolute -inset-3"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0.3, 0.8] }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="w-full h-full rounded-full border-2 border-ember/60" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cyan Selection Ring - outer glow for focused worker */}
              <AnimatePresence>
                {isFocused && (
                  <motion.div
                    className="absolute -inset-8 pointer-events-none"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    {/* Pulsing outer ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full border border-cyan/30"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    {/* Inner selection ring */}
                    <motion.div
                      className="absolute inset-2 rounded-full border-2 border-cyan"
                      animate={{ 
                        boxShadow: ["0 0 15px rgba(0,242,255,0.6)", "0 0 30px rgba(0,242,255,0.9)", "0 0 15px rgba(0,242,255,0.6)"]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status ring for focused/incident/protocol workers - SYNCHRONIZED AMBER PULSE */}
              <AnimatePresence>
                {(isFocused || isInProtocol) && (
                  <motion.div
                    className="absolute -inset-4"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <motion.div
                      className={`w-full h-full rounded-full border-2 ${
                        worker.inRestrictedZone ? 'border-[#FF8C00]' :
                        isInProtocol ? 'border-ember' : 'border-cyan'
                      }`}
                      animate={{ 
                        rotate: 360,
                        boxShadow: worker.inRestrictedZone
                          ? ["0 0 20px rgba(255,140,0,0.5)", "0 0 40px rgba(255,140,0,0.8)", "0 0 20px rgba(255,140,0,0.5)"]
                          : isInProtocol 
                          ? ["0 0 20px rgba(255,191,0,0.5)", "0 0 40px rgba(255,191,0,0.8)", "0 0 20px rgba(255,191,0,0.5)"]
                          : ["0 0 20px rgba(0,242,255,0.5)", "0 0 40px rgba(0,242,255,0.8)", "0 0 20px rgba(0,242,255,0.5)"]
                      }}
                      transition={{ 
                        rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                        boxShadow: { duration: 1.5, repeat: Infinity }
                      }}
                    />
                    {/* Corner markers */}
                    {[0, 90, 180, 270].map((angle) => (
                      <motion.div
                        key={angle}
                        className={`absolute w-2 h-2 ${
                          worker.inRestrictedZone ? 'bg-[#FF8C00]' :
                          isInProtocol ? 'bg-ember' : 'bg-cyan'
                        }`}
                        style={{
                          top: "50%",
                          left: "50%",
                          transform: `rotate(${angle}deg) translateY(-20px) translateX(-50%)`,
                        }}
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: angle / 360 }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Worker node dot - SYNCED with protocol state */}
              <motion.div
                className={`rounded-full ${isPPEFailing ? 'bg-[#FF8C00]' : getStatusColor(worker)} ${getStatusGlow(worker, isFocused)}`}
                style={{
                  width: isFocused ? "20px" : "14px",
                  height: isFocused ? "20px" : "14px",
                }}
                animate={(isInProtocol || worker.inRestrictedZone || isPPEFailing) ? {
                  scale: [1, 1.3, 1],
                } : {}}
                transition={{ duration: 1.5, repeat: (isInProtocol || worker.inRestrictedZone || isPPEFailing) ? Infinity : 0 }}
                whileHover={{ scale: 1.5 }}
              />

              {/* Worker ID label */}
              <motion.div
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: isFocused ? 1 : 0.7 }}
              >
                <span className={`text-[9px] font-mono ${
                  isPPEFailing ? 'text-[#FF8C00]' :
                  worker.inRestrictedZone ? 'text-[#FF8C00]' :
                  isInProtocol ? 'text-ember' : 'text-cyan'
                }`}>
                  {worker.id}
                </span>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Focused worker data card */}
      <AnimatePresence>
        {focusedWorkerId && focusedWorker && (
          <motion.div
            className="absolute z-20 glass-panel p-4 min-w-[240px] glow-border-cyan"
            style={{
              left: `${Math.min(Math.max(focusedWorker.position.x, 30), 70)}%`,
              top: `${focusedWorker.position.y > 50 ? focusedWorker.position.y - 35 : focusedWorker.position.y + 25}%`,
            }}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <motion.div 
                className={`w-3 h-3 rounded-full ${getStatusColor(focusedWorker)}`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="hud-label text-xs">{focusedWorker.id}</span>
              <span className={`ml-auto text-[10px] font-mono uppercase ${
                focusedWorker.status === "safe" ? "text-cyan" :
                focusedWorker.status === "warning" ? "text-ember" : "text-danger"
              }`}>
                {focusedWorker.status}
              </span>
            </div>
            <p className="text-cyan font-orbitron text-sm font-bold">{focusedWorker.name}</p>
            
            {/* Zone breach warning */}
            {focusedWorker.inRestrictedZone && (
              <motion.div 
                className="mt-2 px-2 py-1 bg-[#FF8C00]/20 border border-[#FF8C00]/50 rounded text-[10px] text-[#FF8C00] font-mono"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                ⚠ RESTRICTED ZONE BREACH
              </motion.div>
            )}
            
            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zone:</span>
                <span className={focusedWorker.inRestrictedZone ? 'text-[#FF8C00]' : 'text-cyan'}>
                  {focusedWorker.zone}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">PPE:</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-obsidian-light rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${focusedWorker.ppe >= 90 ? 'bg-cyan' : focusedWorker.ppe >= 70 ? 'bg-ember' : 'bg-danger'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${focusedWorker.ppe}%` }}
                    />
                  </div>
                  <span className={focusedWorker.ppe >= 90 ? 'text-cyan' : focusedWorker.ppe >= 70 ? 'text-ember' : 'text-danger'}>
                    {focusedWorker.ppe}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Heart Rate:</span>
                <motion.span 
                  className={focusedWorker.hrElevated ? 'text-ember' : 'text-cyan'}
                  animate={focusedWorker.hrElevated ? { opacity: [1, 0.5, 1] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  {focusedWorker.heartRate} BPM {focusedWorker.hrElevated && '↑'}
                </motion.span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">O2 Level:</span>
                <span className={focusedWorker.oxygenLevel < 94 ? 'text-ember' : 'text-cyan'}>
                  {focusedWorker.oxygenLevel}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coords:</span>
                <span className="text-cyan">
                  [{focusedWorker.position.x.toFixed(1)}, {focusedWorker.position.y.toFixed(1)}]
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone labels */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 hud-label text-cyan/70">SECTOR NORTH</div>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 hud-label text-cyan/70">SECTOR SOUTH</div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 hud-label text-cyan/70 rotate-[-90deg]">WEST</div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 hud-label text-cyan/70 rotate-90">EAST</div>
    </motion.div>
  );
};

export default HexGrid;
