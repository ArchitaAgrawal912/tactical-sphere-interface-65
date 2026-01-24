import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface WorkerNode {
  id: string;
  name: string;
  status: "safe" | "warning" | "danger";
  position: { x: number; y: number };
  ppe: number;
  zone: string;
}

const mockWorkers: WorkerNode[] = [
  { id: "W-001", name: "Chen, Marcus", status: "safe", position: { x: 35, y: 30 }, ppe: 100, zone: "Alpha-7" },
  { id: "W-002", name: "Rodriguez, Ana", status: "warning", position: { x: 65, y: 45 }, ppe: 85, zone: "Beta-3" },
  { id: "W-003", name: "Kim, David", status: "safe", position: { x: 50, y: 65 }, ppe: 100, zone: "Alpha-7" },
  { id: "W-004", name: "Okonkwo, Emeka", status: "danger", position: { x: 25, y: 55 }, ppe: 45, zone: "Gamma-1" },
  { id: "W-005", name: "Petrov, Yuri", status: "safe", position: { x: 75, y: 70 }, ppe: 100, zone: "Delta-9" },
  { id: "W-006", name: "Johnson, Sarah", status: "warning", position: { x: 40, y: 80 }, ppe: 72, zone: "Beta-3" },
];

const HexGrid = () => {
  const [hoveredWorker, setHoveredWorker] = useState<WorkerNode | null>(null);
  const [pulseKey, setPulseKey] = useState(0);

  // Trigger pulse every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseKey(prev => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: WorkerNode["status"]) => {
    switch (status) {
      case "safe": return "bg-cyan";
      case "warning": return "bg-ember";
      case "danger": return "bg-danger";
    }
  };

  const getStatusGlow = (status: WorkerNode["status"]) => {
    switch (status) {
      case "safe": return "shadow-[0_0_20px_rgba(0,242,255,0.9)]";
      case "warning": return "shadow-[0_0_20px_rgba(255,191,0,0.9)]";
      case "danger": return "shadow-[0_0_20px_rgba(255,0,0,0.9)]";
    }
  };

  return (
    <div className="relative w-full aspect-square mx-auto">
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

      {/* Sonar pulse effect */}
      <motion.div
        key={pulseKey}
        className="absolute inset-0 rounded-full border-2 border-cyan"
        initial={{ scale: 0.1, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 0 }}
        transition={{ duration: 3, ease: "easeOut" }}
        style={{ boxShadow: "0 0 20px rgba(0,242,255,0.5)" }}
      />
      <motion.div
        key={`pulse2-${pulseKey}`}
        className="absolute inset-0 rounded-full border border-cyan/60"
        initial={{ scale: 0.1, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 0 }}
        transition={{ duration: 3, delay: 0.3, ease: "easeOut" }}
      />
      <motion.div
        key={`pulse3-${pulseKey}`}
        className="absolute inset-0 rounded-full border border-cyan/40"
        initial={{ scale: 0.1, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 0 }}
        transition={{ duration: 3, delay: 0.6, ease: "easeOut" }}
      />

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

      {/* Center point with pulsing glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="w-6 h-6 bg-cyan rounded-full"
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
      </div>

      {/* Worker nodes */}
      {mockWorkers.map((worker, index) => (
        <motion.div
          key={worker.id}
          className={`absolute cursor-pointer ${getStatusColor(worker.status)} rounded-full ${getStatusGlow(worker.status)}`}
          style={{
            left: `${worker.position.x}%`,
            top: `${worker.position.y}%`,
            width: hoveredWorker?.id === worker.id ? "18px" : "14px",
            height: hoveredWorker?.id === worker.id ? "18px" : "14px",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 1,
            opacity: 1,
            x: "-50%",
            y: "-50%"
          }}
          whileHover={{ scale: 1.5 }}
          onHoverStart={() => setHoveredWorker(worker)}
          onHoverEnd={() => setHoveredWorker(null)}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 30,
            delay: index * 0.1
          }}
        />
      ))}

      {/* Hovering data card */}
      {hoveredWorker && (
        <motion.div
          className="absolute z-20 glass-panel p-4 min-w-[220px] glow-border-cyan"
          style={{
            left: `${Math.min(Math.max(hoveredWorker.position.x, 30), 70)}%`,
            top: `${hoveredWorker.position.y > 50 ? hoveredWorker.position.y - 30 : hoveredWorker.position.y + 20}%`,
          }}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <motion.div 
              className={`w-3 h-3 rounded-full ${getStatusColor(hoveredWorker.status)}`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="hud-label text-xs">{hoveredWorker.id}</span>
          </div>
          <p className="text-cyan font-orbitron text-sm font-bold">{hoveredWorker.name}</p>
          <div className="mt-3 space-y-1.5 text-xs font-mono text-muted-foreground">
            <div className="flex justify-between">
              <span>Zone:</span>
              <span className="text-cyan">{hoveredWorker.zone}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>PPE:</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-obsidian-light rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full ${hoveredWorker.ppe >= 90 ? 'bg-cyan' : hoveredWorker.ppe >= 70 ? 'bg-ember' : 'bg-danger'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${hoveredWorker.ppe}%` }}
                  />
                </div>
                <span className={hoveredWorker.ppe >= 90 ? 'text-cyan' : hoveredWorker.ppe >= 70 ? 'text-ember' : 'text-danger'}>
                  {hoveredWorker.ppe}%
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`uppercase font-bold ${
                hoveredWorker.status === "safe" ? "text-cyan" :
                hoveredWorker.status === "warning" ? "text-ember" : "text-danger"
              }`}>{hoveredWorker.status}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Zone labels */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 hud-label text-cyan/70">SECTOR NORTH</div>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 hud-label text-cyan/70">SECTOR SOUTH</div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 hud-label text-cyan/70 rotate-[-90deg]">WEST</div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 hud-label text-cyan/70 rotate-90">EAST</div>
    </div>
  );
};

export default HexGrid;
