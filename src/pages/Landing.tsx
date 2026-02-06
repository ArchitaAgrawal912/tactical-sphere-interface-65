import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import BootButton from "@/components/BootButton";
import { Shield, Cpu, Eye, Radio, ArrowRight, Play } from "lucide-react";

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
    { icon: <Eye className="w-6 h-6" />, label: "Computer Vision", desc: "AI-powered real-time hazard detection across your entire facility" },
    { icon: <Shield className="w-6 h-6" />, label: "PPE Compliance", desc: "Automated tracking ensures 100% safety gear adherence" },
    { icon: <Cpu className="w-6 h-6" />, label: "Edge Processing", desc: "Sub-second response times with on-device neural inference" },
    { icon: <Radio className="w-6 h-6" />, label: "Live Telemetry", desc: "Real-time worker vitals and environmental monitoring" },
  ];

  const stats = [
    { value: "99.7%", label: "Detection Accuracy" },
    { value: "<50ms", label: "Response Time" },
    { value: "24/7", label: "Continuous Monitoring" },
    { value: "0", label: "Blind Spots" },
  ];

  return (
    <AnimatePresence>
      {!isBooting && (
        <motion.div
          className="min-h-screen bg-obsidian relative overflow-hidden"
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
        >
          {/* Subtle gradient background */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian to-obsidian-light" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-cyan/5 rounded-full blur-[120px]" />
          </div>

          {/* Minimal grid pattern */}
          <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
            <div className="w-full h-full" style={{
              backgroundImage: `linear-gradient(rgba(0,242,255,0.3) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(0,242,255,0.3) 1px, transparent 1px)`,
              backgroundSize: '80px 80px'
            }} />
          </div>

          {/* Navigation */}
          <motion.nav
            className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan to-cyan/50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-obsidian" />
                </div>
                <span className="font-orbitron font-semibold text-lg text-foreground tracking-wide">
                  TACTICAL<span className="text-ember">SPHERE</span>
                </span>
              </div>
              <div className="hidden md:flex items-center gap-10">
                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Solutions</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                <button 
                  onClick={handleBoot}
                  className="px-5 py-2.5 bg-cyan text-obsidian font-medium text-sm rounded-lg hover:bg-cyan-glow transition-colors"
                >
                  Launch Demo
                </button>
              </div>
            </div>
          </motion.nav>

          {/* Hero Section */}
          <main className="relative z-10 min-h-screen flex flex-col justify-center px-6 md:px-12 pt-24 pb-16">
            <div className="max-w-7xl mx-auto w-full">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Left content */}
                <motion.div 
                  className="space-y-8"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  <motion.div
                    className="inline-flex items-center gap-2 px-4 py-2 bg-cyan/10 border border-cyan/20 rounded-full"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <span className="text-xs font-medium text-cyan tracking-wide">Next-Generation Industrial Safety</span>
                  </motion.div>

                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold leading-[1.1] tracking-tight">
                    <span className="text-foreground">Intelligent Safety</span>
                    <br />
                    <span className="text-foreground">Surveillance for</span>
                    <br />
                    <span className="bg-gradient-to-r from-cyan to-cyan-glow bg-clip-text text-transparent">Modern Industry</span>
                  </h1>

                  <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                    Protect your workforce with AI-powered real-time monitoring. 
                    Zero blind spots, instant alerts, complete peace of mind.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <motion.button
                      onClick={handleBoot}
                      className="group flex items-center gap-3 px-8 py-4 bg-cyan text-obsidian font-semibold rounded-lg hover:bg-cyan-glow transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Play className="w-5 h-5" />
                      Start Live Demo
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                    <button className="px-8 py-4 border border-muted-foreground/30 text-foreground font-medium rounded-lg hover:border-cyan/50 hover:bg-cyan/5 transition-all">
                      Learn More
                    </button>
                  </div>
                </motion.div>

                {/* Right - Stats Grid */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        className="p-6 rounded-2xl bg-obsidian-light/50 border border-cyan/10 backdrop-blur-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        whileHover={{ borderColor: "rgba(0,242,255,0.3)", y: -2 }}
                      >
                        <p className="text-3xl md:text-4xl font-orbitron font-bold text-cyan mb-2">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Decorative element */}
                  <div className="absolute -inset-4 -z-10 bg-gradient-to-r from-cyan/10 via-transparent to-ember/10 rounded-3xl blur-2xl opacity-50" />
                </motion.div>
              </div>
            </div>
          </main>

          {/* Features Section */}
          <section id="features" className="relative z-10 px-6 md:px-12 py-24 border-t border-cyan/10">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-foreground mb-4">
                  Built for Critical Environments
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Enterprise-grade safety monitoring powered by cutting-edge AI technology
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.label}
                    className="group p-6 rounded-2xl bg-obsidian-light/30 border border-transparent hover:border-cyan/20 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center text-cyan mb-4 group-hover:bg-cyan/20 transition-colors">
                      {feature.icon}
                    </div>
                    <h3 className="font-orbitron font-semibold text-foreground mb-2">{feature.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="relative z-10 px-6 md:px-12 py-24">
            <motion.div
              className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-b from-cyan/10 to-transparent border border-cyan/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-foreground mb-4">
                Ready to Transform Your Safety Operations?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Experience the future of industrial safety monitoring with our live demonstration.
              </p>
              <BootButton onBoot={handleBoot} />
            </motion.div>
          </section>

          {/* Footer */}
          <footer className="relative z-10 px-6 md:px-12 py-8 border-t border-cyan/10">
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
