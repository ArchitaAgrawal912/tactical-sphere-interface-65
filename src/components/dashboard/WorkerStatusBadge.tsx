import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { WorkerTelemetry } from "@/utils/simEngine";

interface WorkerStatusBadgeProps {
  worker: WorkerTelemetry;
}

const WorkerStatusBadge = ({ worker }: WorkerStatusBadgeProps) => {
  // Determine status based on biometrics and geofence
  const getStatus = (): "stable" | "warning" | "critical" => {
    if (worker.status === "danger" || worker.heartRate > 125 || worker.oxygenLevel < 90) {
      return "critical";
    }
    if (worker.status === "warning" || worker.inRestrictedZone || worker.hrElevated) {
      return "warning";
    }
    return "stable";
  };

  const status = getStatus();

  const config = {
    stable: {
      label: "STABLE",
      icon: CheckCircle,
      className: "bg-cyan/10 border-cyan/30 text-cyan",
      pulse: false,
    },
    warning: {
      label: "WARNING",
      icon: AlertTriangle,
      className: "bg-ember/10 border-ember/30 text-ember",
      pulse: true,
    },
    critical: {
      label: "CRITICAL",
      icon: AlertCircle,
      className: "bg-danger/10 border-danger/30 text-danger",
      pulse: true,
    },
  };

  const { label, icon: Icon, className, pulse } = config[status];

  return (
    <motion.div
      className={`flex items-center gap-1.5 px-2 py-1 rounded border ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        ...(pulse && { boxShadow: ["0 0 0px currentColor", "0 0 8px currentColor", "0 0 0px currentColor"] })
      }}
      transition={{ 
        duration: 0.3,
        ...(pulse && { boxShadow: { duration: 1, repeat: Infinity } })
      }}
    >
      <Icon className="w-3 h-3" />
      <span className="text-[10px] font-mono font-bold">{label}</span>
    </motion.div>
  );
};

export default WorkerStatusBadge;
