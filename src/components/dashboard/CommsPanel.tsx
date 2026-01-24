import { motion, AnimatePresence } from "framer-motion";
import { Terminal, AlertTriangle, ChevronRight } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import { useState, useEffect, useRef } from "react";

const CommsPanel = () => {
  const { 
    logs, 
    setFocusedWorkerId, 
    setActiveIncident, 
    setIsWarping, 
    setZoomLevel,
    clearLogs,
    triggerManualIncident,
    alertScrollTrigger,
    workers,
  } = useSimulationStore();

  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to top when alertScrollTrigger changes
  useEffect(() => {
    if (alertScrollTrigger > 0 && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [alertScrollTrigger]);

  const handleLogClick = (log: typeof logs[0]) => {
    if (log.incident) {
      setActiveIncident(log.incident);
      setFocusedWorkerId(log.workerId || null);
      setIsWarping(true);
      setZoomLevel(1.5);
      
      setTimeout(() => setIsWarping(false), 800);
      setTimeout(() => setZoomLevel(1), 5000);
    }
  };

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && command.trim()) {
      const cmd = command.trim().toUpperCase();
      setCommandHistory(prev => [...prev, cmd]);
      
      if (cmd === "RESET") {
        clearLogs();
      } else if (cmd.startsWith("FALL ")) {
        const workerId = cmd.replace("FALL ", "").trim();
        // Format worker ID properly
        const formattedId = workerId.startsWith("W-") ? workerId : `W-${workerId.padStart(3, "0")}`;
        const worker = workers.find(w => w.id === formattedId);
        if (worker) {
          triggerManualIncident(formattedId, "fall");
        }
      } else if (cmd === "HELP") {
        // Could add help message to logs
      }
      
      setCommand("");
    }
  };

  const getTypeColor = (type: typeof logs[0]["type"]) => {
    switch (type) {
      case "info": return "text-cyan/60";
      case "detection": return "text-cyan";
      case "warning": return "text-ember/80";
      case "alert": return "text-ember";
      case "critical": return "text-danger";
    }
  };

  const getTypePrefix = (type: typeof logs[0]["type"]) => {
    switch (type) {
      case "info": return "[INF]";
      case "detection": return "[DET]";
      case "warning": return "[WRN]";
      case "alert": return "[ALT]";
      case "critical": return "[CRT]";
    }
  };

  const getTypeBg = (type: typeof logs[0]["type"]) => {
    switch (type) {
      case "critical": return "bg-danger/10 border-danger/30";
      case "alert": return "bg-ember/10 border-ember/30";
      default: return "bg-transparent border-transparent";
    }
  };

  return (
    <motion.div
      className="glass-panel clip-corner-bl p-4 w-80"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Terminal className="w-4 h-4 text-cyan" />
        <span className="hud-label">AI Detection Log</span>
        <div className="ml-auto flex items-center gap-1">
          <motion.div 
            className="w-1.5 h-1.5 bg-cyan rounded-full"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-[10px] font-mono text-muted-foreground">LIVE</span>
        </div>
      </div>

      {/* Terminal output */}
      <div 
        ref={scrollRef}
        className="h-52 overflow-y-auto overflow-x-hidden bg-obsidian rounded border border-cyan/10 p-2 scrollbar-thin scrollbar-thumb-cyan/20 scrollbar-track-transparent"
      >
        <div className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {logs.map((log, index) => (
              <motion.div
                key={log.id}
                layout
                className={`terminal-text text-[10px] leading-relaxed rounded px-2 py-1.5 border cursor-pointer transition-colors hover:bg-cyan/5 ${getTypeBg(log.type)}`}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ 
                  opacity: index === 0 ? 1 : Math.max(0.3, 1 - index * 0.1), 
                  x: 0,
                  height: "auto"
                }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => handleLogClick(log)}
              >
                {/* High priority indicator */}
                {(log.type === "critical" || log.type === "alert") && (
                  <motion.div
                    className="flex items-center gap-1 mb-1"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <AlertTriangle className={`w-3 h-3 ${log.type === "critical" ? "text-danger" : "text-ember"}`} />
                    <span className={`text-[9px] uppercase font-bold ${log.type === "critical" ? "text-danger" : "text-ember"}`}>
                      {log.type === "critical" ? "CRITICAL ALERT" : "HIGH PRIORITY"}
                    </span>
                    {log.workerId && (
                      <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto" />
                    )}
                  </motion.div>
                )}
                
                <div className="flex items-start gap-1">
                  <span className="text-muted-foreground shrink-0">{log.timestamp}</span>
                  <span className={`${getTypeColor(log.type)} shrink-0`}>{getTypePrefix(log.type)}</span>
                </div>
                <p className={`${getTypeColor(log.type)} mt-0.5 break-words`}>
                  {log.message.length > 150 ? log.message.slice(0, 150) + "..." : log.message}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Command input - functional */}
      <div className="mt-3 flex items-center gap-2 bg-obsidian border border-cyan/20 rounded px-2 py-1 focus-within:border-cyan/50 transition-colors">
        <span className="text-cyan text-xs font-mono">&gt;</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleCommand}
          placeholder="RESET | FALL 001"
          className="flex-1 bg-transparent text-xs font-mono text-cyan placeholder:text-muted-foreground/50 focus:outline-none"
        />
      </div>

      {/* Quick stats */}
      <div className="flex gap-2 mt-3">
        <div className="flex-1 bg-obsidian/50 rounded p-2 border border-cyan/10 text-center">
          <p className="text-[9px] font-mono text-muted-foreground">ALERTS</p>
          <p className="text-ember font-orbitron font-bold text-sm">
            {logs.filter(l => l.type === "alert" || l.type === "critical").length}
          </p>
        </div>
        <div className="flex-1 bg-obsidian/50 rounded p-2 border border-cyan/10 text-center">
          <p className="text-[9px] font-mono text-muted-foreground">DETECTIONS</p>
          <p className="text-cyan font-orbitron font-bold text-sm">
            {logs.filter(l => l.type === "detection").length}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default CommsPanel;
