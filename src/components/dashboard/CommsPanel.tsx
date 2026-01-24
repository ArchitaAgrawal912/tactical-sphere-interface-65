import { motion, AnimatePresence } from "framer-motion";
import { Terminal, AlertTriangle, ChevronRight, Radio, Target } from "lucide-react";
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
    triggerSonarPulse,
    setTrackedWorkerId,
    activateProtocol,
    activeProtocol,
    focusedWorkerId,
  } = useSimulationStore();

  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const logsLengthRef = useRef(logs.length);

  // Auto-scroll to top (newest entries) when new logs are added
  useEffect(() => {
    if (logs.length > logsLengthRef.current && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    logsLengthRef.current = logs.length;
  }, [logs.length]);

  // Scroll to top when alertScrollTrigger changes (header alerts click)
  useEffect(() => {
    if (alertScrollTrigger > 0 && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [alertScrollTrigger]);

  // Clear feedback after 2 seconds
  useEffect(() => {
    if (commandFeedback) {
      const timer = setTimeout(() => setCommandFeedback(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [commandFeedback]);

  const handleLogClick = (log: typeof logs[0]) => {
    // Set active highlight
    setActiveLogId(log.id);
    
    // Clear active highlight after 5 seconds
    setTimeout(() => setActiveLogId(null), 5000);
    
    // Focus and warp to worker
    if (log.workerId) {
      setFocusedWorkerId(log.workerId);
      setTrackedWorkerId(log.workerId);
      setIsWarping(true);
      setZoomLevel(1.25);
      
      setTimeout(() => setIsWarping(false), 800);
      setTimeout(() => setZoomLevel(1), 8000);
    }
    
    // Activate protocol if incident exists and no active protocol
    if (log.incident) {
      setActiveIncident(log.incident);
      if (!activeProtocol && (log.incident.severity === "critical" || log.incident.severity === "high")) {
        activateProtocol(log.incident);
      }
    }
  };

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && command.trim()) {
      const cmd = command.trim().toUpperCase();
      setCommandHistory(prev => [...prev, cmd]);
      
      if (cmd === "CLEAR" || cmd === "RESET") {
        clearLogs();
        setCommandFeedback("✓ Log cleared");
      } else if (cmd.startsWith("EMERGENCY ") || cmd.startsWith("FALL ")) {
        const workerId = cmd.replace("EMERGENCY ", "").replace("FALL ", "").trim();
        // Format worker ID properly
        const formattedId = workerId.startsWith("W-") ? workerId : `W-${workerId.padStart(3, "0")}`;
        const worker = workers.find(w => w.id === formattedId);
        if (worker) {
          triggerManualIncident(formattedId, "fall");
          setCommandFeedback(`✓ Emergency triggered for ${formattedId}`);
        } else {
          setCommandFeedback(`✗ Worker ${formattedId} not found`);
        }
      } else if (cmd === "SCAN") {
        triggerSonarPulse();
        setCommandFeedback("✓ Sonar pulse initiated");
      } else if (cmd === "HELP") {
        setCommandFeedback("Commands: CLEAR, EMERGENCY [ID], SCAN");
      } else {
        setCommandFeedback(`✗ Unknown command: ${cmd}`);
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
      className="glass-panel clip-corner-bl p-3 w-full"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Terminal className="w-4 h-4 text-cyan" />
        <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan">AI Detection Log</span>
        <div className="ml-auto flex items-center gap-1">
          <motion.div 
            className="w-1.5 h-1.5 bg-cyan rounded-full"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-[10px] font-mono text-muted-foreground tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Terminal output */}
      <div 
        ref={scrollRef}
        className="h-44 overflow-y-auto overflow-x-hidden bg-obsidian rounded border border-cyan/10 p-2 scrollbar-thin scrollbar-thumb-cyan/20 scrollbar-track-transparent"
      >
        <div className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {logs.map((log, index) => {
              const isActive = activeLogId === log.id;
              const isLinkedToFocused = log.workerId === focusedWorkerId;
              
              return (
              <motion.div
                key={log.id}
                layout
                className={`terminal-text text-[10px] leading-relaxed rounded px-2 py-1.5 border cursor-pointer transition-all ${getTypeBg(log.type)} ${
                  isActive 
                    ? 'ring-2 ring-cyan ring-offset-1 ring-offset-obsidian' 
                    : isLinkedToFocused
                      ? 'border-cyan/50 bg-cyan/5'
                      : 'hover:bg-cyan/5'
                }`}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ 
                  opacity: index === 0 ? 1 : Math.max(0.4, 1 - index * 0.08), 
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
                      <div className="flex items-center gap-0.5 ml-auto">
                        <Target className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[8px] text-muted-foreground">{log.workerId}</span>
                      </div>
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
              );
            })}
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
          placeholder="CLEAR | EMERGENCY 01 | SCAN"
          className="flex-1 bg-transparent text-xs font-mono text-cyan placeholder:text-muted-foreground/50 focus:outline-none"
        />
      </div>

      {/* Command feedback */}
      <AnimatePresence>
        {commandFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-1 text-[10px] font-mono ${commandFeedback.startsWith("✓") ? "text-cyan" : "text-ember"}`}
          >
            {commandFeedback}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live voice waveform simulation */}
      <div className="flex items-center gap-2 mt-3 px-2 py-1.5 bg-obsidian/50 rounded border border-cyan/10">
        <Radio className="w-3 h-3 text-cyan/60" />
        <span className="text-[9px] font-mono text-muted-foreground">COMMS</span>
        <div className="flex items-center gap-0.5 ml-auto">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="w-0.5 bg-cyan/60 rounded-full"
              animate={{
                height: [3, Math.random() * 10 + 4, 3],
              }}
              transition={{
                duration: 0.3 + Math.random() * 0.3,
                repeat: Infinity,
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
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
