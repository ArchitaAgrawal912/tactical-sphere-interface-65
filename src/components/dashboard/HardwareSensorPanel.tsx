import { motion, AnimatePresence } from "framer-motion";
import { 
  Thermometer, Wind, Flame, Activity, Wifi, WifiOff, 
  AlertTriangle, TrendingUp, RotateCcw 
} from "lucide-react";
import { useSensorData } from "@/hooks/useSensorData";
import { ScrollArea } from "@/components/ui/scroll-area";

const HardwareSensorPanel = () => {
  const { 
    sensorStatus, 
    temperatureHistory, 
    smokeLevelHistory,
    isConnected, 
    error, 
    refetch 
  } = useSensorData();

  const getDangerColor = (level: string) => {
    switch (level) {
      case "CRITICAL": return "text-destructive";
      case "HIGH": 
      case "WARNING": return "text-amber";
      case "MEDIUM":
      case "CAUTION": return "text-amber";
      default: return "text-primary";
    }
  };

  const getDangerBgColor = (level: string) => {
    switch (level) {
      case "CRITICAL": return "bg-destructive/10 border-destructive/30";
      case "HIGH":
      case "WARNING": return "bg-amber/10 border-amber/30";
      default: return "bg-primary/10 border-primary/30";
    }
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "--:--:--";
    return new Date(isoString).toLocaleTimeString("en-US", { hour12: false });
  };

  return (
    <motion.div
      className="w-full h-full flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      {/* Header */}
      <div className="shrink-0 pb-3 mb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-primary' : 'bg-destructive'}`} />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Hardware Sensors
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={refetch}
              className="p-1 hover:bg-muted/50 rounded transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-1">
              {isConnected ? (
                <Wifi className="w-3.5 h-3.5 text-primary" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-destructive" />
              )}
              <span className={`text-[9px] font-mono ${isConnected ? 'text-primary' : 'text-destructive'}`}>
                {isConnected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-2 px-2 py-1 bg-destructive/10 border border-destructive/30 rounded text-[10px] text-destructive">
            {error}
          </div>
        )}

        {/* Last Update */}
        <div className="mt-2 px-2 py-1 bg-muted/30 rounded">
          <span className="text-[9px] font-mono text-muted-foreground">
            LAST UPDATE: {formatTime(sensorStatus.lastUpdated)}
          </span>
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-3 pr-2">
          {/* Overall Danger Level */}
          <div className={`rounded-lg p-3 border ${getDangerBgColor(sensorStatus.dangerLevel)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${getDangerColor(sensorStatus.dangerLevel)}`} />
                <span className="text-xs font-medium text-foreground">Danger Level</span>
              </div>
              <motion.span 
                className={`text-sm font-mono font-bold ${getDangerColor(sensorStatus.dangerLevel)}`}
                animate={sensorStatus.dangerLevel === "CRITICAL" ? { opacity: [1, 0.5, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {sensorStatus.dangerLevel}
              </motion.span>
            </div>
          </div>

          {/* Temperature Card */}
          <div className="bg-muted/30 rounded-lg p-3 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">MPU6050 Temp</span>
              </div>
              <span className={`text-lg font-mono font-bold ${
                sensorStatus.temperature > 50 ? 'text-destructive' : 
                sensorStatus.temperature > 40 ? 'text-amber' : 'text-primary'
              }`}>
                {sensorStatus.temperature.toFixed(1)}°C
              </span>
            </div>
            {/* Mini sparkline placeholder */}
            <div className="h-6 flex items-end gap-0.5">
              {temperatureHistory.slice(-20).map((temp, i) => (
                <div 
                  key={i}
                  className="flex-1 bg-primary/50 rounded-t"
                  style={{ height: `${Math.min(100, (temp / 60) * 100)}%` }}
                />
              ))}
            </div>
          </div>

          {/* Fire Sensor Card */}
          <div className={`rounded-lg p-3 border ${
            sensorStatus.fireDetected ? 'bg-destructive/10 border-destructive/30' : 'bg-muted/30 border-border'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={sensorStatus.fireDetected ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3, repeat: Infinity }}
                >
                  <Flame className={`w-4 h-4 ${sensorStatus.fireDetected ? 'text-destructive' : 'text-muted-foreground'}`} />
                </motion.div>
                <span className="text-xs text-muted-foreground">Fire Sensor</span>
              </div>
              <span className={`text-sm font-mono font-bold ${
                sensorStatus.fireDetected ? 'text-destructive' : 'text-primary'
              }`}>
                {sensorStatus.fireDetected ? 'DETECTED!' : 'CLEAR'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Intensity:</span>
                <span className={getDangerColor(sensorStatus.fireLevel || "SAFE")}>
                  {sensorStatus.fireIntensity.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Level:</span>
                <span className={getDangerColor(sensorStatus.fireLevel || "SAFE")}>
                  {sensorStatus.fireLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Smoke Sensor Card */}
          <div className={`rounded-lg p-3 border ${
            sensorStatus.smokeStatus === "CRITICAL" || sensorStatus.smokeStatus === "HIGH" 
              ? 'bg-amber/10 border-amber/30' 
              : 'bg-muted/30 border-border'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Smoke/Gas (MQ-2)</span>
              </div>
              <span className={`text-sm font-mono font-bold ${getDangerColor(sensorStatus.smokeStatus)}`}>
                {sensorStatus.smokeStatus}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Level:</span>
                <span>{sensorStatus.smokeLevel.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. PPM:</span>
                <span>{sensorStatus.smokePpm.toFixed(0)}</span>
              </div>
            </div>
            {/* Smoke level bar */}
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${
                  sensorStatus.smokeLevel > 60 ? 'bg-destructive' :
                  sensorStatus.smokeLevel > 30 ? 'bg-amber' : 'bg-primary'
                }`}
                animate={{ width: `${Math.min(100, sensorStatus.smokeLevel)}%` }}
              />
            </div>
          </div>

          {/* Movement/Accelerometer Card */}
          <div className={`rounded-lg p-3 border ${
            sensorStatus.movementStatus !== "NORMAL" 
              ? 'bg-amber/10 border-amber/30' 
              : 'bg-muted/30 border-border'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">MPU6050 Motion</span>
              </div>
              <span className={`text-sm font-mono font-bold ${
                sensorStatus.movementStatus !== "NORMAL" ? 'text-amber' : 'text-primary'
              }`}>
                {sensorStatus.movementStatus}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono mb-2">
              <div className="text-center">
                <span className="text-muted-foreground block">X</span>
                <span className="text-foreground">{sensorStatus.accelX.toFixed(2)}g</span>
              </div>
              <div className="text-center">
                <span className="text-muted-foreground block">Y</span>
                <span className="text-foreground">{sensorStatus.accelY.toFixed(2)}g</span>
              </div>
              <div className="text-center">
                <span className="text-muted-foreground block">Z</span>
                <span className="text-foreground">{sensorStatus.accelZ.toFixed(2)}g</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pitch:</span>
                <span>{sensorStatus.pitch.toFixed(1)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Roll:</span>
                <span>{sensorStatus.roll.toFixed(1)}°</span>
              </div>
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-mono">
              <span className="text-muted-foreground">Magnitude:</span>
              <span className={sensorStatus.accelMagnitude > 1.5 ? 'text-amber' : 'text-primary'}>
                {sensorStatus.accelMagnitude.toFixed(3)}g
              </span>
            </div>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default HardwareSensorPanel;
