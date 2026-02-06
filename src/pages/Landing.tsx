import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, ChevronDown } from "lucide-react";
import HelmetIllustration from "@/components/HelmetIllustration";

const Landing = () => {
  const navigate = useNavigate();
  const [isBooting, setIsBooting] = useState(false);

  const handleBoot = () => {
    setIsBooting(true);
    setTimeout(() => {
      navigate("/dashboard");
    }, 500);
  };

  const stats = [
    { value: "0", label: "False Positives", color: "text-cyan" },
    { value: "<60g", label: "Module Weight", color: "text-ember" },
    { value: "10s", label: "Detection Time", color: "text-success" },
  ];

  return (
    <AnimatePresence>
      {!isBooting && (
        <motion.div
          className="min-h-screen bg-obsidian relative overflow-hidden"
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
        >
          {/* Subtle ambient glow */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-cyan/5 rounded-full blur-[150px]" />
          </div>

          {/* Navigation */}
          <motion.nav
            className="fixed top-0 left-0 right-0 z-50 px-8 md:px-16 py-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-cyan" />
                <span className="font-orbitron font-semibold text-lg text-foreground tracking-wide">
                  TACTICAL<span className="text-ember">SPHERE</span>
                </span>
              </div>
              <div className="hidden md:flex items-center gap-10">
                <a href="#technology" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Technology</a>
                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                <button 
                  onClick={handleBoot}
                  className="px-5 py-2.5 bg-cyan text-obsidian font-medium text-sm rounded hover:bg-cyan-glow transition-colors"
                >
                  Launch Demo
                </button>
              </div>
            </div>
          </motion.nav>

          {/* Hero Section */}
          <main className="relative z-10 min-h-screen flex flex-col justify-center px-8 md:px-16 pt-24">
            <div className="max-w-7xl mx-auto w-full">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left content */}
                <motion.div 
                  className="space-y-8"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  {/* Badge */}
                  <motion.div
                    className="inline-flex items-center gap-2 px-4 py-2 border border-ember/50 rounded-full"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Shield className="w-4 h-4 text-ember" />
                    <span className="text-sm font-medium text-ember tracking-wide">Industrial Safety IoT</span>
                  </motion.div>

                  {/* Headline */}
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-orbitron font-bold leading-[1.1] tracking-tight">
                    <span className="text-foreground">Safety is </span>
                    <span className="text-cyan">No Longer</span>
                    <br />
                    <span className="text-foreground">a Blind Spot.</span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                    A multi-layered safety ecosystem: <span className="text-cyan">Computer Vision</span> for the site, 
                    and <span className="text-ember">Smart IoT</span> for the worker.
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <motion.button
                      onClick={() => document.getElementById('technology')?.scrollIntoView({ behavior: 'smooth' })}
                      className="group flex items-center gap-2 px-6 py-3 bg-cyan text-obsidian font-semibold rounded hover:bg-cyan-glow transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Eye className="w-5 h-5" />
                      Explore Technology
                    </motion.button>
                    <button 
                      onClick={handleBoot}
                      className="px-6 py-3 border border-cyan/50 text-cyan font-medium rounded hover:bg-cyan/10 transition-all"
                    >
                      View Live Demo
                    </button>
                  </div>

                  {/* Stats Row */}
                  <motion.div 
                    className="flex items-center gap-12 pt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    {stats.map((stat, i) => (
                      <div key={stat.label} className="text-center">
                        <p className={`text-3xl md:text-4xl font-orbitron font-bold ${stat.color}`}>
                          {stat.value}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 tracking-wide">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Right - Helmet Illustration */}
                <motion.div
                  className="relative flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <HelmetIllustration />
                </motion.div>
              </div>

              {/* Scroll indicator */}
              <motion.div 
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <span className="text-xs font-mono text-muted-foreground tracking-widest">Scroll to explore</span>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              </motion.div>
            </div>
          </main>

          {/* Technology Section */}
          <section id="technology" className="relative z-10 px-8 md:px-16 py-32">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="grid lg:grid-cols-2 gap-16 items-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="space-y-6">
                  <span className="text-sm font-mono text-cyan tracking-widest">01 — TECHNOLOGY</span>
                  <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-foreground">
                    AI-Powered <span className="text-cyan">Protection</span>
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Our neural network processes 60 frames per second, identifying potential hazards 
                    before they become incidents. Edge computing ensures sub-50ms response times.
                  </p>
                  <div className="grid grid-cols-2 gap-6 pt-4">
                    <div className="p-4 border border-cyan/10 rounded-lg">
                      <p className="text-2xl font-orbitron font-bold text-cyan">99.7%</p>
                      <p className="text-sm text-muted-foreground">Detection Accuracy</p>
                    </div>
                    <div className="p-4 border border-cyan/10 rounded-lg">
                      <p className="text-2xl font-orbitron font-bold text-ember">24/7</p>
                      <p className="text-sm text-muted-foreground">Active Monitoring</p>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-video bg-obsidian-light/50 rounded-lg border border-cyan/10 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full border-2 border-cyan/30 flex items-center justify-center">
                          <Eye className="w-8 h-8 text-cyan" />
                        </div>
                        <p className="text-sm font-mono text-muted-foreground">Live Vision Feed</p>
                      </div>
                    </div>
                    {/* Simulated grid overlay */}
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: `linear-gradient(rgba(0,242,255,0.1) 1px, transparent 1px),
                                       linear-gradient(90deg, rgba(0,242,255,0.1) 1px, transparent 1px)`,
                      backgroundSize: '40px 40px'
                    }} />
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="relative z-10 px-8 md:px-16 py-32 border-t border-cyan/10">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-sm font-mono text-cyan tracking-widest">02 — FEATURES</span>
                <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-foreground mt-4">
                  Complete Safety <span className="text-ember">Ecosystem</span>
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { 
                    title: "Computer Vision", 
                    desc: "Real-time hazard detection across your entire facility with zero blind spots.",
                    stat: "60 FPS",
                    statLabel: "Processing"
                  },
                  { 
                    title: "Wearable IoT", 
                    desc: "Lightweight smart modules track worker vitals and environmental conditions.",
                    stat: "<60g",
                    statLabel: "Weight"
                  },
                  { 
                    title: "Instant Alerts", 
                    desc: "Multi-channel emergency notifications reach workers in under 10 seconds.",
                    stat: "10s",
                    statLabel: "Response"
                  },
                ].map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    className="group p-8 bg-obsidian-light/30 border border-cyan/10 rounded-lg hover:border-cyan/30 transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <p className="text-4xl font-orbitron font-bold text-cyan mb-2">{feature.stat}</p>
                    <p className="text-xs text-muted-foreground mb-6">{feature.statLabel}</p>
                    <h3 className="font-orbitron font-semibold text-foreground text-lg mb-3">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="relative z-10 px-8 md:px-16 py-32">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-foreground mb-6">
                Ready to Eliminate <span className="text-cyan">Blind Spots</span>?
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Experience the future of industrial safety with our live demonstration dashboard.
              </p>
              <motion.button
                onClick={handleBoot}
                className="px-10 py-4 bg-cyan text-obsidian font-orbitron font-bold text-lg rounded hover:bg-cyan-glow transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Launch Live Demo
              </motion.button>
            </motion.div>
          </section>

          {/* Footer */}
          <footer className="relative z-10 px-8 md:px-16 py-8 border-t border-cyan/10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-cyan" />
                <span className="font-orbitron text-sm text-muted-foreground">
                  TACTICALSPHERE © 2024
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                <a href="#" className="hover:text-foreground transition-colors">Contact</a>
              </div>
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Landing;
