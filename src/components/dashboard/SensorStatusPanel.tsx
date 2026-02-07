import { motion } from "framer-motion";
import { Flame, Wind, Activity, AlertTriangle, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SensorData {
  temperature: number;
  smokeLevel: number;
  smokePpm?: number;
  smokeStatus: string;
  fireDetected: boolean;
  fireIntensity: number;
  fireLevel: string;
  accelX: number;
  accelY: number;
  accelZ: number;
  accelMagnitude?: number;
  pitch: number;
  roll: number;
  movementStatus: string;
  dangerLevel: string;
  lastUpdated: string | null;
}

interface SensorStatusPanelProps {
  data: SensorData;
  isLive?: boolean;
  isConnected?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "CRITICAL":
    case "FIRE DETECTED":
    case "IMPACT DETECTED":
    case "FREEFALL/TILT":
      return "text-destructive bg-destructive/10 border-destructive/30";
    case "HIGH":
    case "WARNING":
    case "HEAVY MOVEMENT":
      return "text-amber bg-amber/10 border-amber/30";
    case "MEDIUM":
    case "CAUTION":
    case "LOW":
      return "text-amber bg-amber/5 border-amber/20";
    default:
      return "text-primary bg-primary/10 border-primary/30";
  }
};

const getStatusBadge = (status: string) => {
  const isCritical = ["CRITICAL", "FIRE DETECTED", "IMPACT DETECTED", "FREEFALL/TILT"].includes(status);
  const isWarning = ["HIGH", "WARNING", "HEAVY MOVEMENT", "MEDIUM", "CAUTION", "LOW"].includes(status);
  
  return (
    <span className={cn(
      "px-2 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wide",
      isCritical && "bg-destructive text-destructive-foreground animate-pulse",
      isWarning && "bg-amber text-amber-foreground",
      !isCritical && !isWarning && "bg-primary/20 text-primary"
    )}>
      {status}
    </span>
  );
};

const SensorCard = ({ 
  icon: Icon, 
  title, 
  status, 
  children,
  isCritical = false
}: { 
  icon: React.ElementType; 
  title: string; 
  status: string;
  children: React.ReactNode;
  isCritical?: boolean;
}) => (
  <motion.div
    className={cn(
      "p-3 rounded-lg border transition-all",
      getStatusColor(status),
      isCritical && "animate-pulse"
    )}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
      </div>
      {getStatusBadge(status)}
    </div>
    <div className="space-y-1 text-xs font-mono">
      {children}
    </div>
  </motion.div>
);

const SensorStatusPanel = ({ data, isLive = false, isConnected = true }: SensorStatusPanelProps) => {
  const formatTime = (dateString: string | null) => {
    if (!dateString) return "--:--:--";
    try {
      return new Date(dateString).toLocaleTimeString("en-US", { hour12: false });
    } catch {
      return "--:--:--";
    }
  };

  const isCritical = data.dangerLevel === "CRITICAL";

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-primary animate-pulse" : "bg-destructive"
          )} />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Safety Monitor
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-mono rounded">
              LIVE
            </span>
          )}
          <span className="text-[10px] font-mono text-muted-foreground">
            {formatTime(data.lastUpdated)}
          </span>
        </div>
      </div>

      {/* Fire Sensor */}
      <SensorCard 
        icon={Flame} 
        title="Fire Sensor" 
        status={data.fireLevel}
        isCritical={data.fireDetected}
      >
        <div className="flex justify-between">
          <span className="text-muted-foreground">Detected:</span>
          <span className={data.fireDetected ? "text-destructive font-bold" : ""}>
            {data.fireDetected ? "🔥 YES!" : "No"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Intensity:</span>
          <span>{data.fireIntensity.toFixed(1)}%</span>
        </div>
      </SensorCard>

      {/* Smoke Sensor */}
      <SensorCard 
        icon={Wind} 
        title="Smoke Sensor" 
        status={data.smokeStatus}
        isCritical={data.smokeStatus === "CRITICAL"}
      >
        <div className="flex justify-between">
          <span className="text-muted-foreground">Level:</span>
          <span>{data.smokeLevel.toFixed(1)}% above baseline</span>
        </div>
        {data.smokePpm !== undefined && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Est. PPM:</span>
            <span>{data.smokePpm.toFixed(0)}</span>
          </div>
        )}
      </SensorCard>

      {/* Motion Sensor (MPU6050) */}
      <SensorCard 
        icon={Activity} 
        title="Motion (MPU6050)" 
        status={data.movementStatus === "NORMAL" ? "SAFE" : data.movementStatus}
        isCritical={data.movementStatus === "IMPACT DETECTED" || data.movementStatus === "FREEFALL/TILT"}
      >
        <div className="grid grid-cols-3 gap-2 text-center mb-1">
          <div>
            <span className="text-muted-foreground block text-[10px]">X</span>
            <span>{data.accelX.toFixed(2)}g</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">Y</span>
            <span>{data.accelY.toFixed(2)}g</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">Z</span>
            <span>{data.accelZ.toFixed(2)}g</span>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pitch/Roll:</span>
          <span>{data.pitch.toFixed(1)}° / {data.roll.toFixed(1)}°</span>
        </div>
      </SensorCard>

      {/* Temperature */}
      <SensorCard 
        icon={Thermometer} 
        title="Temperature" 
        status={data.temperature > 45 ? "WARNING" : "SAFE"}
      >
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Current:</span>
          <span className="text-lg font-bold">{data.temperature.toFixed(1)}°C</span>
        </div>
      </SensorCard>

      {/* Overall Danger Level */}
      <motion.div
        className={cn(
          "p-4 rounded-lg border-2 text-center transition-all",
          getStatusColor(data.dangerLevel),
          isCritical && "animate-pulse"
        )}
        animate={isCritical ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 0.5, repeat: isCritical ? Infinity : 0 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-wider">Overall Danger Level</span>
        </div>
        <span className={cn(
          "text-2xl font-mono font-bold",
          isCritical && "text-destructive"
        )}>
          {data.dangerLevel}
        </span>
      </motion.div>
    </div>
  );
};

export default SensorStatusPanel;
