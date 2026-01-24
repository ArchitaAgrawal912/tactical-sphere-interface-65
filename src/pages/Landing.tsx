import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HeroHelmet from "@/components/HeroHelmet";
import BrutalistHeader from "@/components/BrutalistHeader";
import BootButton from "@/components/BootButton";
import Scanlines from "@/components/Scanlines";
import { Shield, Cpu, Eye, Radio } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const [isBooting, setIsBooting] = useState(false);

  const handleBoot = () => {
    setIsBooting(true);
    setTimeout(() => {
      navigate("/dashboard");
    }, 500);
  };

  const features = [
    { icon: <Eye className="w-5 h-5" />, label: "AI Vision", desc: "Real-time detection" },
    { icon: <Shield className="w-5 h-5" />, label: "PPE Tracking", desc: "100% compliance" },
    { icon: <Cpu className="w-5 h-5" />, label: "Neural Core", desc: "Edge processing" },
    { icon: <Radio className="w-5 h-5" />, label: "Live Sync", desc: "Zero latency" },
  ];

  return (
    <AnimatePresence>
      {!isBooting && (
        <motion.div
          className="min-h-screen bg-obsidian relative overflow-hidden"
          exit={{ opacity: 0, filter: "blur(20px)" }}
          transition={{ duration: 0.5 }}
        >
          <Scanlines />

          {/* Ambient background effects */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,242,255,0.08)_0%,transparent_60%)]" />
            <motion.div 
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan/5 blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-ember/5 blur-3xl"
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 6, repeat: Infinity }}
            />
          </div>

          {/* Grid background */}
          <div className="fixed inset-0 pointer-events-none -z-10">
            <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
              <pattern id="landingGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#landingGrid)" />
            </svg>
          </div>

          {/* Navigation */}
          <motion.nav
            className="fixed top-0 left-0 right-0 z-50 px-8 py-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-cyan" />
                <span className="font-orbitron font-bold text-xl text-cyan tracking-wider">
                  TACTICAL<span className="text-ember">SPHERE</span>
                </span>
              </div>
              <div className="flex items-center gap-8">
                <a href="#" className="hud-label hover:text-cyan transition-colors">Protocol</a>
                <a href="#" className="hud-label hover:text-cyan transition-colors">Systems</a>
                <a href="#" className="hud-label hover:text-cyan transition-colors">Intel</a>
              </div>
            </div>
          </motion.nav>

          {/* Hero section */}
          <main className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center gap-12 px-8 pt-24">
            {/* Left content */}
            <motion.div 
              className="flex-1 max-w-2xl"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan/10 border border-cyan/30 rounded-full mb-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="w-2 h-2 bg-cyan rounded-full animate-pulse" />
                <span className="text-xs font-mono text-cyan tracking-wider">NEXT-GEN INDUSTRIAL OVERSIGHT</span>
              </motion.div>

              <BrutalistHeader 
                title="THE FUTURE IS WATCHING"
                subtitle="AI-powered safety surveillance for the modern industrial frontier. Zero blind spots. Maximum protection."
              />

              {/* Feature pills */}
              <motion.div 
                className="flex flex-wrap gap-4 mt-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.label}
                    className="flex items-center gap-3 px-4 py-3 glass-panel rounded"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + i * 0.1 }}
                    whileHover={{ scale: 1.02, borderColor: "rgba(0,242,255,0.5)" }}
                  >
                    <div className="text-cyan">{feature.icon}</div>
                    <div>
                      <p className="text-sm font-orbitron text-cyan">{feature.label}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Boot button */}
              <motion.div 
                className="mt-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
              >
                <BootButton onBoot={handleBoot} />
              </motion.div>
            </motion.div>

            {/* Right - Helmet hero */}
            <motion.div 
              className="flex-1 max-w-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <HeroHelmet />
            </motion.div>
          </main>

          {/* Bottom decorative elements */}
          <motion.div 
            className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-cyan/50" />
            <span className="text-[10px] font-mono text-muted-foreground tracking-widest">SCROLL TO EXPLORE</span>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-cyan/50" />
          </motion.div>

          {/* Lens flare effect */}
          <div className="fixed top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan/20 to-transparent pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Landing;
