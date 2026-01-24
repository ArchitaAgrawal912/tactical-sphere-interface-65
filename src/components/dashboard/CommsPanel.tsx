import { motion, AnimatePresence } from "framer-motion";
import { Terminal, AlertTriangle, Radio, Target, Eye, Wrench } from "lucide-react";
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
    activeIncident,
  } = useSimulationStore();

  const [command, setCommand] = useState("");
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
    
    // Set active incident if exists
    if (log.incident) {
      setActiveIncident(log.incident);
    }
  };

  // Handle action button click - always activates/updates protocol
  const handleActionClick = (e: React.MouseEvent, log: typeof logs[0]) => {
    e.stopPropagation(); // Prevent log click
    
    if (!log.incident) return;
    
    // Focus on worker
    if (log.workerId) {
      setFocusedWorkerId(log.workerId);
      setTrackedWorkerId(log.workerId);
      setIsWarping(true);
      setZoomLevel(1.25);
      setTimeout(() => setIsWarping(false), 800);
    }
    
    // Set active incident and activate/update protocol
    setActiveIncident(log.incident);
    activateProtocol(log.incident);
    setActiveLogId(log.id);
    setTimeout(() => setActiveLogId(null), 3000);
  };

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && command.trim()) {
      const cmd = command.trim().toUpperCase();
      
      if (cmd === "CLEAR" || cmd === "RESET") {
        clearLogs();
        setCommandFeedback("✓ System reset complete");
      } else if (cmd.startsWith("EMERGENCY ") || cmd.startsWith("FALL ")) {
        const workerId = cmd.replace("EMERGENCY ", "").replace("FALL ", "").trim();
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
        setCommandFeedback("CLEAR, EMERGENCY [ID], SCAN");
      } else {
        setCommandFeedback(`✗ Unknown: ${cmd}`);
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
      default: return "bg-transparent border-cyan/10";
    }
  };

  // Check if this log's incident is currently active in protocol
  const isIncidentActive = (log: typeof logs[0]) => {
    return log.incident && activeIncident?.id === log.incident.id;
  };

  return (
    <motion.div
      className="glass-panel clip-corner-bl p-3 w-full h-full flex flex-col"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <Terminal className="w-4 h-4 text-cyan" />
        <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan">AI Detection Log</span>
        <div className="ml-auto flex items-center gap-1">
          <motion.div 
            className="w-1.5 h-1.5 bg-cyan rounded-full"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-[9px] font-mono text-muted-foreground">LIVE</span>
        </div>
      </div>

      {/* Terminal output with enhanced scrolling - fills available space */}
      <div 
        ref={scrollRef}
        className="flex-1 min-h-0 max-h-[280px] overflow-y-auto overflow-x-hidden bg-obsidian rounded border border-cyan/10 scrollbar-thin"
      >
        <div className="p-2 pb-[50px] space-y-2">
          <AnimatePresence mode="popLayout">
            {logs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6"
              >
                <p className="text-[10px] font-mono text-muted-foreground">SYSTEMS NOMINAL</p>
                <p className="text-[9px] font-mono text-muted-foreground/50 mt-1">No active alerts</p>
              </motion.div>
            ) : (
              logs.map((log, index) => {
                const isActive = activeLogId === log.id;
                const isLinkedToFocused = log.workerId === focusedWorkerId;
                const isCurrentIncident = isIncidentActive(log);
                const hasActionableIncident = log.incident && (log.type === "critical" || log.type === "alert");
                
                return (
                  <motion.div
                    key={log.id}
                    layout
                    className={`terminal-text text-[10px] leading-relaxed rounded px-2 py-2 border cursor-pointer transition-all ${getTypeBg(log.type)} ${
                      isActive 
                        ? 'ring-2 ring-cyan ring-offset-1 ring-offset-obsidian' 
                        : isCurrentIncident
                          ? 'ring-1 ring-ember/50 bg-ember/5'
                          : isLinkedToFocused
                            ? 'border-cyan/50 bg-cyan/5'
                            : 'hover:bg-cyan/5'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: index === 0 ? 1 : Math.max(0.5, 1 - index * 0.06), 
                      x: 0,
                    }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => handleLogClick(log)}
                  >
                    {/* High priority indicator */}
                    {(log.type === "critical" || log.type === "alert") && (
                      <motion.div
                        className="flex items-center gap-1 mb-1.5"
                        animate={{ opacity: [1, 0.6, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      >
                        <AlertTriangle className={`w-3 h-3 ${log.type === "critical" ? "text-danger" : "text-ember"}`} />
                        <span className={`text-[9px] uppercase font-bold ${log.type === "critical" ? "text-danger" : "text-ember"}`}>
                          {log.type === "critical" ? "CRITICAL" : "ALERT"}
                        </span>
                        {log.workerId && (
                          <div className="flex items-center gap-0.5 ml-auto">
                            <Target className="w-2.5 h-2.5 text-muted-foreground" />
                            <span className="text-[8px] text-muted-foreground">{log.workerId}</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                    
                    <div className="flex items-start gap-1 mb-0.5">
                      <span className="text-muted-foreground shrink-0 text-[9px]">{log.timestamp}</span>
                      <span className={`${getTypeColor(log.type)} shrink-0 text-[9px]`}>{getTypePrefix(log.type)}</span>
                    </div>
                    
                    <p className={`${getTypeColor(log.type)} break-words text-[9px] leading-relaxed`}>
                      {log.message.length > 120 ? log.message.slice(0, 120) + "..." : log.message}
                    </p>

                    {/* Action button for alerts */}
                    {hasActionableIncident && (
                      <motion.button
                        onClick={(e) => handleActionClick(e, log)}
                        className={`mt-2 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-[9px] font-mono font-bold transition-all active:scale-95 ${
                          isCurrentIncident
                            ? 'bg-cyan/20 border border-cyan/50 text-cyan'
                            : log.type === "critical"
                              ? 'bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 hover:border-danger hover:shadow-[0_0_12px_rgba(255,0,0,0.4)]'
                              : 'bg-ember/10 border border-ember/30 text-ember hover:bg-ember/20 hover:border-ember hover:shadow-[0_0_12px_rgba(255,191,0,0.4)]'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isCurrentIncident ? (
                          <>
                            <Eye className="w-3 h-3" />
                            VIEW PROTOCOL
                          </>
                        ) : (
                          <>
                            <Wrench className="w-3 h-3" />
                            FIX ALERT
                          </>
                        )}
                      </motion.button>
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Command input */}
      <div className="mt-2 flex items-center gap-2 bg-obsidian border border-cyan/20 rounded px-2 py-1 focus-within:border-cyan/50 transition-colors shrink-0">
        <span className="text-cyan text-[10px] font-mono">&gt;</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleCommand}
          placeholder="CLEAR | EMERGENCY 01 | SCAN"
          className="flex-1 bg-transparent text-[10px] font-mono text-cyan placeholder:text-muted-foreground/50 focus:outline-none"
        />
      </div>

      {/* Command feedback */}
      <AnimatePresence>
        {commandFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-1 text-[9px] font-mono ${commandFeedback.startsWith("✓") ? "text-cyan" : "text-ember"}`}
          >
            {commandFeedback}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live voice waveform simulation */}
      <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-obsidian/50 rounded border border-cyan/10 shrink-0">
        <Radio className="w-3 h-3 text-cyan/60" />
        <span className="text-[8px] font-mono text-muted-foreground">COMMS</span>
        <div className="flex items-center gap-0.5 ml-auto">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="w-0.5 bg-cyan/60 rounded-full"
              animate={{
                height: [2, Math.random() * 8 + 3, 2],
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
      <div className="flex gap-2 mt-2 shrink-0">
        <div className="flex-1 bg-obsidian/50 rounded p-1.5 border border-cyan/10 text-center">
          <p className="text-[8px] font-mono text-muted-foreground">ALERTS</p>
          <p className="text-ember font-orbitron font-bold text-xs">
            {logs.filter(l => l.type === "alert" || l.type === "critical").length}
          </p>
        </div>
        <div className="flex-1 bg-obsidian/50 rounded p-1.5 border border-cyan/10 text-center">
          <p className="text-[8px] font-mono text-muted-foreground">DETECTIONS</p>
          <p className="text-cyan font-orbitron font-bold text-xs">
            {logs.filter(l => l.type === "detection").length}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default CommsPanel;
