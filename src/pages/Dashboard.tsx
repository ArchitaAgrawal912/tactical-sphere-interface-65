import { motion } from "framer-motion";
import { useEffect, useState, lazy, Suspense } from "react";
import SensorStatusPanel from "@/components/dashboard/SensorStatusPanel";
import CriticalEventsLog from "@/components/dashboard/CriticalEventsLog";
import LiveStreamPanel from "@/components/dashboard/LiveStreamPanel";
import { Shield, Cpu, Link2, Radio, Monitor } from "lucide-react";
import { useSensorData } from "@/hooks/useSensorData";
import { useSimulatedSensors } from "@/hooks/useSimulatedSensors";
import { Switch } from "@/components/ui/switch";

// Lazy load the HexGrid for performance
const HexGrid = lazy(() => import("@/components/dashboard/HexGrid"));

const Dashboard = () => {
  const [time, setTime] = useState(new Date());
  const [useHardwareData, setUseHardwareData] = useState(false);
  
  // Hardware data from Supabase Realtime
  const { sensorStatus: hardwareData, isConnected } = useSensorData();
  
  // Simulated data for demo mode
  const simulatedData = useSimulatedSensors(!useHardwareData, 2000);
  
  // Choose which data source to use
  const currentData = useHardwareData ? {
    temperature: hardwareData.temperature,
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
        <div className="max-w-[1800px] mx-auto px-6 py-3 flex items-center justify-between">
          {/* Left: Logo and Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground tracking-tight">
                Safety Monitor
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
                  {useHardwareData ? (isConnected ? 'Connected' : 'Offline') : 'Simulation'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Mode Toggle and Time */}
          <div className="flex items-center gap-4">
            {/* Mode Toggle */}
            <div className="flex items-center gap-3 px-3 py-2 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-1.5">
                <Monitor className={`w-3.5 h-3.5 ${!useHardwareData ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-medium ${!useHardwareData ? 'text-primary' : 'text-muted-foreground'}`}>
                  Sim
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
          <div className="max-w-[1800px] mx-auto px-6 py-6">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-foreground tracking-tight">Safety Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Real-time sensor monitoring • {useHardwareData ? "Hardware Mode" : "Simulation Mode"}
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

            {/* Main Bento Grid */}
            <div className="grid grid-cols-12 gap-4 auto-rows-min">
              {/* Left Column - Sensor Status Panel */}
              <div className="col-span-12 lg:col-span-3">
                <motion.div
                  className="bg-card rounded-xl border border-border p-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <SensorStatusPanel 
                    data={currentData}
                    isLive={useHardwareData}
                    isConnected={useHardwareData ? isConnected : true}
                  />
                </motion.div>
              </div>

              {/* Center - Site Map (Hex Grid) */}
              <div className="col-span-12 lg:col-span-6">
                <motion.div
                  className="bg-card rounded-xl border border-border p-4 aspect-square max-h-[600px] flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  }>
                    <HexGrid />
                  </Suspense>
                </motion.div>
              </div>

              {/* Right Column - Critical Events Log + Live Feed */}
              <div className="col-span-12 lg:col-span-3 space-y-4">
                {/* Critical Events Log */}
                <motion.div
                  className="bg-card rounded-xl border border-border h-[400px] overflow-hidden"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
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
                
                {/* Live Feed (Optional) */}
                <motion.div
                  className="bg-card rounded-xl border border-border overflow-hidden"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <LiveStreamPanel />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-6 border-t border-border bg-card">
          <div className="max-w-[1800px] mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Safety Monitor • MPU6050 + Fire + Smoke Sensors</span>
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
