import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import HexGrid from "@/components/dashboard/HexGrid";
import VitalsPanel from "@/components/dashboard/VitalsPanel";
import LiveStreamPanel from "@/components/dashboard/LiveStreamPanel";
import CommsPanel from "@/components/dashboard/CommsPanel";
import MetricsPanel from "@/components/dashboard/MetricsPanel";
import Scanlines from "@/components/Scanlines";
import { AlertTriangle, Shield, Users, Bell } from "lucide-react";

const Dashboard = () => {
  const [isGlitching, setIsGlitching] = useState(false);
  const [time, setTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Random glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.85) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 300);
      }
    }, 5000);
    return () => clearInterval(glitchInterval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "2-digit", 
      day: "2-digit" 
    }).replace(/\//g, ".");
  };

  return (
    <div className={`min-h-screen bg-obsidian relative overflow-hidden ${isGlitching ? 'glitch-effect' : ''}`}>
      <Scanlines />

      {/* Top header bar */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-40 glass-panel border-b border-cyan/20 px-6 py-3"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-cyan" />
              <span className="font-orbitron font-bold text-cyan tracking-wider">TACTICAL SPHERE</span>
            </div>
            <div className="h-4 w-px bg-cyan/30" />
            <span className="hud-label">Industrial Safety Command Center</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Stats pills */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-cyan/10 border border-cyan/30 rounded">
                <Users className="w-3 h-3 text-cyan" />
                <span className="text-xs font-mono text-cyan">28 ACTIVE</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-ember/10 border border-ember/30 rounded">
                <AlertTriangle className="w-3 h-3 text-ember" />
                <span className="text-xs font-mono text-ember">3 ALERTS</span>
              </div>
            </div>

            <div className="h-4 w-px bg-cyan/30" />

            {/* Notifications */}
            <button className="relative p-2 hover:bg-cyan/10 rounded transition-colors">
              <Bell className="w-4 h-4 text-cyan" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-ember rounded-full text-[8px] flex items-center justify-center">3</span>
            </button>

            {/* Time display */}
            <div className="text-right">
              <p className="font-mono text-cyan text-sm">{formatTime(time)}</p>
              <p className="font-mono text-muted-foreground text-[10px]">{formatDate(time)}</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main dashboard layout */}
      <main className="pt-20 min-h-screen relative">
        {/* Corner HUD panels - Hidden on smaller screens */}
        <div className="fixed top-24 left-4 z-30 hidden xl:block">
          <VitalsPanel />
        </div>

        <div className="fixed top-24 right-4 z-30 hidden xl:block">
          <LiveStreamPanel />
        </div>

        <div className="fixed bottom-4 left-4 z-30 hidden xl:block">
          <CommsPanel />
        </div>

        <div className="fixed bottom-4 right-4 z-30 hidden xl:block">
          <MetricsPanel />
        </div>

        {/* Central hex grid - Larger and more prominent */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
          <motion.div
            className="w-full max-w-[800px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <HexGrid />
          </motion.div>
        </div>

        {/* Ambient grid background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.03)_0%,transparent_50%)]" />
          <svg className="absolute inset-0 w-full h-full opacity-5">
            <pattern id="bgGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#bgGrid)" />
          </svg>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
