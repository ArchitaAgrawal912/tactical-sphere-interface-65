import { motion } from "framer-motion";
import { ShieldCheck, Activity, CheckCircle2, Radio, Wifi } from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";

const SystemsNominalPanel = () => {
  const { workers, isRunning } = useSimulationStore();
  
  const safeWorkers = workers.filter(w => w.status === "safe").length;
  const avgPPE = Math.round(workers.reduce((acc, w) => acc + w.ppe, 0) / workers.length);

  return (
    <motion.div
      className="glass-panel clip-corner-br p-3 w-full"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-4 h-4 text-cyan" />
        <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan">
          System Status
        </span>
      </div>

      {/* Systems Nominal Banner */}
      <motion.div
        className="relative overflow-hidden rounded-lg border border-cyan/30 bg-cyan/5 p-4 mb-4"
        animate={{ 
          boxShadow: [
            "0 0 10px rgba(0,242,255,0.1)",
            "0 0 20px rgba(0,242,255,0.2)",
            "0 0 10px rgba(0,242,255,0.1)"
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {/* Scanning line effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan/10 to-transparent"
          animate={{ y: ["-100%", "200%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="relative flex flex-col items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <CheckCircle2 className="w-8 h-8 text-cyan" />
          </motion.div>
          <span className="text-lg font-orbitron font-bold text-cyan tracking-widest">
            SYSTEMS NOMINAL
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            All parameters within threshold
          </span>
        </div>
      </motion.div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-obsidian/50 rounded p-2 border border-cyan/10">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity className="w-3 h-3 text-cyan/60" />
            <span className="text-[9px] font-mono text-muted-foreground">WORKERS</span>
          </div>
          <p className="text-cyan font-orbitron font-bold">{safeWorkers}/{workers.length}</p>
          <p className="text-[8px] font-mono text-cyan/60">OPERATIONAL</p>
        </div>
        
        <div className="bg-obsidian/50 rounded p-2 border border-cyan/10">
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-3 h-3 text-cyan/60" />
            <span className="text-[9px] font-mono text-muted-foreground">PPE COMP.</span>
          </div>
          <p className={`font-orbitron font-bold ${avgPPE >= 90 ? 'text-cyan' : avgPPE >= 70 ? 'text-ember' : 'text-danger'}`}>
            {avgPPE}%
          </p>
          <p className="text-[8px] font-mono text-cyan/60">COMPLIANT</p>
        </div>
      </div>

      {/* Connection Status */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-obsidian/50 rounded border border-cyan/10">
        <div className="flex items-center gap-2">
          <motion.div
            className={`w-2 h-2 rounded-full ${isRunning ? 'bg-cyan' : 'bg-ember'}`}
            animate={isRunning ? { opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-[9px] font-mono text-muted-foreground">
            {isRunning ? 'MONITORING ACTIVE' : 'PAUSED'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Radio className="w-3 h-3 text-cyan/60" />
          <Wifi className="w-3 h-3 text-cyan/60" />
        </div>
      </div>

      {/* Awaiting instructions */}
      <div className="mt-3 text-center">
        <p className="text-[9px] font-mono text-muted-foreground">
          Awaiting incident for protocol activation
        </p>
      </div>
    </motion.div>
  );
};

export default SystemsNominalPanel;
