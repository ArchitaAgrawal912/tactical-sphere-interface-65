import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import SensorStatusPanel from "@/components/dashboard/SensorStatusPanel";
import CriticalEventsLog from "@/components/dashboard/CriticalEventsLog";
import { Shield, Cpu, Link2, Radio, Monitor } from "lucide-react";
import { useSensorData } from "@/hooks/useSensorData";
import { useSimulatedSensors } from "@/hooks/useSimulatedSensors";
import { Switch } from "@/components/ui/switch";

const Dashboard = () => {
  const [time, setTime] = useState(new Date());
  const [useHardwareData, setUseHardwareData] = useState(false);
  
  // Hardware data from Supabase Realtime
  const { sensorStatus: hardwareData, isConnected } = useSensorData();
  
  // Simulated data for demo mode - only runs when NOT in hardware mode
  const simulatedData = useSimulatedSensors(!useHardwareData, 2000);
  
  // Choose which data source to use
  const currentData = useHardwareData ? {
    smokeLevel: hardwareData.smokeLevel,
    smokePpm: hardwareData.smokePpm,
    smokeStatus: hardwareData.smokeStatus,
    fireDetected: hardwareData.fireDetected,
    fireIntensity: hardwareData.fireIntensity,
    fireLevel: hardwareData.fireLevel,
    accelX: hardwareData.accelX,
    accelY: hardwareData.accelY,
    accelZ: hardwareData.accelZ,
    accelMagnitude: hardwareData.accelMagnitude,
    pitch: hardwareData.pitch,
    roll: hardwareData.roll,
    movementStatus: hardwareData.movementStatus,
    dangerLevel: hardwareData.dangerLevel,
    lastUpdated: hardwareData.lastUpdated,
  } : simulatedData;
  
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => date.toLocaleTimeString("en-US", { hour12: false });
  const formatDate = (date: Date) => date.toLocaleDateString("en-US", { 
    year: "numeric", month: "short", day: "numeric" 
  });

  const isCritical = currentData.dangerLevel === "CRITICAL";

  return (
    <div className={`min-h-screen bg-background transition-all duration-200`}>
      {/* Critical alert overlay */}
      {isCritical && (
        <motion.div
          className="fixed inset-0 z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <div className="absolute inset-0 bg-destructive/20" />
          <div className="absolute inset-0 border-2 border-destructive" />
        </motion.div>
      )}

      {/* Clean Professional Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          {/* Left: Logo and Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground tracking-tight">
                IoT Safety Monitor
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-border">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Cpu className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground">System Active</span>
              </div>
              
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
                useHardwareData 
                  ? isConnected ? 'bg-primary/10' : 'bg-destructive/10'
                  : 'bg-muted/50'
              }`}>
                <motion.div
                  className={`w-1.5 h-1.5 rounded-full ${
                    useHardwareData 
                      ? isConnected ? 'bg-primary' : 'bg-destructive'
                      : 'bg-muted-foreground'
                  }`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <Link2 className={`w-3 h-3 ${
                  useHardwareData 
                    ? isConnected ? 'text-primary' : 'text-destructive'
                    : 'text-muted-foreground'
                }`} />
                <span className={`text-xs font-mono ${
                  useHardwareData 
                    ? isConnected ? 'text-primary' : 'text-destructive'
                    : 'text-muted-foreground'
                }`}>
                  {useHardwareData ? (isConnected ? 'Hardware Connected' : 'Hardware Offline') : 'Simulation Mode'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Data Source Toggle and Time */}
          <div className="flex items-center gap-4">
            {/* Data Source Toggle */}
            <div className="flex items-center gap-3 px-3 py-2 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-1.5">
                <Monitor className={`w-3.5 h-3.5 ${!useHardwareData ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-medium ${!useHardwareData ? 'text-primary' : 'text-muted-foreground'}`}>
                  Simulation
                </span>
              </div>
              
              <Switch 
                checked={useHardwareData}
                onCheckedChange={setUseHardwareData}
                className="data-[state=checked]:bg-primary"
              />
              
              <div className="flex items-center gap-1.5">
                <Radio className={`w-3.5 h-3.5 ${useHardwareData ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-medium ${useHardwareData ? 'text-primary' : 'text-muted-foreground'}`}>
                  Hardware
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-border" />

            <div className="text-right">
              <p className="text-xs font-mono text-foreground">{formatTime(time)}</p>
              <p className="text-[10px] text-muted-foreground">{formatDate(time)}</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-16">
        <section className="min-h-[calc(100vh-64px)] relative">
          <div className="max-w-[1400px] mx-auto px-6 py-6">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-foreground tracking-tight">Safety Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Real-time IoT sensor monitoring • {useHardwareData ? "Hardware Mode" : "Simulation Mode"}
                </p>
              </div>
              
              {/* Danger Level Badge */}
              <motion.div
                className={`px-4 py-2 rounded-lg border-2 ${
                  currentData.dangerLevel === "CRITICAL" 
                    ? "bg-destructive/10 border-destructive text-destructive" 
                    : currentData.dangerLevel === "WARNING"
                      ? "bg-amber/10 border-amber text-amber"
                      : "bg-primary/10 border-primary text-primary"
                }`}
                animate={isCritical ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.5, repeat: isCritical ? Infinity : 0 }}
              >
                <span className="text-xs uppercase tracking-wider font-medium">Overall Status</span>
                <p className="text-lg font-mono font-bold">{currentData.dangerLevel}</p>
              </motion.div>
            </div>

            {/* Main Grid - Two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Sensor Status Panel */}
              <motion.div
                className="bg-card rounded-xl border border-border p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <SensorStatusPanel 
                  data={currentData}
                  isLive={useHardwareData}
                  isConnected={useHardwareData ? isConnected : true}
                  moduleId="MOD-01"
                />
              </motion.div>

              {/* Right Column - Critical Events Log */}
              <motion.div
                className="bg-card rounded-xl border border-border overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CriticalEventsLog
                  dangerLevel={currentData.dangerLevel}
                  fireDetected={currentData.fireDetected}
                  fireLevel={currentData.fireLevel}
                  fireIntensity={currentData.fireIntensity}
                  smokeStatus={currentData.smokeStatus}
                  smokeLevel={currentData.smokeLevel}
                  movementStatus={currentData.movementStatus}
                  accelMagnitude={currentData.accelMagnitude}
                />
              </motion.div>
            </div>

            {/* Hardware Mode Instructions */}
            {useHardwareData && !isConnected && (
              <motion.div
                className="mt-6 p-4 bg-amber/10 border border-amber/30 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-sm font-medium text-amber mb-2">⚡ Hardware Mode Active - Waiting for Data</h3>
                <p className="text-xs text-muted-foreground">
                  Run the Python bridge script to start receiving live sensor data from your Raspberry Pi Pico:
                </p>
                <code className="block mt-2 p-2 bg-background rounded text-xs font-mono text-foreground">
                  python scripts/pico_bridge.py
                </code>
              </motion.div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-6 border-t border-border bg-card">
          <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span className="text-xs">IoT Safety Monitor • Fire + Smoke + Motion Sensors</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>v1.0</span>
              <span>•</span>
              <span>Last sync: {formatTime(time)}</span>
            </div>
          </div>
        </footer>
      </main>

      {/* Subtle background grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,209,197,0.02)_0%,transparent_50%)]" />
      </div>
    </div>
  );
};

export default Dashboard;
