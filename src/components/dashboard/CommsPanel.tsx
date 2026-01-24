import { motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { useEffect, useState } from "react";

interface LogEntry {
  id: number;
  timestamp: string;
  type: "info" | "warning" | "alert" | "detection";
  message: string;
}

const generateLog = (id: number): LogEntry => {
  const types: LogEntry["type"][] = ["info", "detection", "warning", "detection", "info"];
  const messages = [
    "Worker W-003 entered Zone Alpha-7",
    "PPE compliance check passed for W-001",
    "Motion detected in restricted area B-2",
    "Helmet detection confirmed for W-005",
    "Temperature anomaly in Sector 4",
    "AI model updated to v3.7.3",
    "Worker W-002 safety vest detected",
    "Perimeter breach attempt blocked",
    "Worker W-006 approaching hazard zone",
    "All systems nominal",
  ];

  const now = new Date();
  const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

  return {
    id,
    timestamp,
    type: types[Math.floor(Math.random() * types.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
  };
};

const CommsPanel = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logId, setLogId] = useState(0);

  useEffect(() => {
    // Initial logs
    const initialLogs = Array.from({ length: 8 }, (_, i) => generateLog(i));
    setLogs(initialLogs);
    setLogId(8);

    // Add new log every 3 seconds
    const interval = setInterval(() => {
      setLogs(prev => {
        const newLog = generateLog(logId);
        setLogId(id => id + 1);
        return [newLog, ...prev.slice(0, 9)];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getTypeColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "info": return "text-cyan/70";
      case "detection": return "text-cyan";
      case "warning": return "text-ember";
      case "alert": return "text-danger";
    }
  };

  const getTypePrefix = (type: LogEntry["type"]) => {
    switch (type) {
      case "info": return "[INF]";
      case "detection": return "[DET]";
      case "warning": return "[WRN]";
      case "alert": return "[ALT]";
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
          <div className="w-1.5 h-1.5 bg-cyan rounded-full animate-pulse" />
          <span className="text-[10px] font-mono text-muted-foreground">LIVE</span>
        </div>
      </div>

      {/* Terminal output */}
      <div className="h-48 overflow-hidden bg-obsidian rounded border border-cyan/10 p-2">
        <div className="space-y-1">
          {logs.map((log, index) => (
            <motion.div
              key={log.id}
              className="terminal-text text-[11px] leading-relaxed"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: index === 0 ? 1 : 0.7 - index * 0.05, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-muted-foreground">{log.timestamp}</span>
              <span className={`${getTypeColor(log.type)} mx-2`}>{getTypePrefix(log.type)}</span>
              <span className={getTypeColor(log.type)}>{log.message}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Command input */}
      <div className="mt-3 flex items-center gap-2 bg-obsidian border border-cyan/20 rounded px-2 py-1">
        <span className="text-cyan text-xs font-mono">&gt;</span>
        <input
          type="text"
          placeholder="Enter command..."
          className="flex-1 bg-transparent text-xs font-mono text-cyan placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
    </motion.div>
  );
};

export default CommsPanel;
