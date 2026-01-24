import { motion } from "framer-motion";
import { Camera, Circle, Maximize2 } from "lucide-react";
import { useEffect, useState } from "react";

const LiveStreamPanel = () => {
  const [scanlinePos, setScanlinePos] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanlinePos(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

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
          <Circle className="w-2 h-2 fill-danger text-danger animate-pulse" />
          <span className="text-[10px] font-mono text-danger">REC</span>
          <Maximize2 className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-cyan transition-colors" />
        </div>
      </div>

      {/* Video frame with scanline effect */}
      <div className="relative aspect-video bg-obsidian rounded overflow-hidden border border-cyan/20">
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
            <div className="w-8 h-8 border border-cyan/50 rounded-full" />
            <div className="absolute top-1/2 left-0 w-3 h-px bg-cyan/50" />
            <div className="absolute top-1/2 right-0 w-3 h-px bg-cyan/50 translate-x-full" />
            <div className="absolute left-1/2 top-0 w-px h-3 bg-cyan/50 -translate-y-full" />
            <div className="absolute left-1/2 bottom-0 w-px h-3 bg-cyan/50 translate-y-full" />
          </div>

          {/* Detection boxes */}
          <motion.div
            className="absolute top-6 left-8 w-12 h-16 border border-cyan"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <span className="absolute -top-4 left-0 text-[8px] font-mono text-cyan">W-003</span>
          </motion.div>

          <motion.div
            className="absolute bottom-8 right-12 w-10 h-14 border border-ember"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
          >
            <span className="absolute -top-4 left-0 text-[8px] font-mono text-ember">W-002</span>
          </motion.div>
        </div>

        {/* Scanline effect */}
        <div
          className="absolute left-0 right-0 h-px bg-cyan/30 pointer-events-none"
          style={{ top: `${scanlinePos}%` }}
        />

        {/* Corner brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-cyan/50" />
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-cyan/50" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-cyan/50" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyan/50" />

        {/* Timestamp */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-cyan/70">
          CAM-01 | 2024.12.19 14:23:45
        </div>
      </div>

      {/* Camera selector */}
      <div className="flex gap-2 mt-3">
        {["CAM-01", "CAM-02", "CAM-03", "CAM-04"].map((cam, i) => (
          <button
            key={cam}
            className={`px-2 py-1 text-[9px] font-mono border transition-colors ${
              i === 0 
                ? "border-cyan text-cyan bg-cyan/10" 
                : "border-muted text-muted-foreground hover:border-cyan/50"
            }`}
          >
            {cam}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default LiveStreamPanel;
