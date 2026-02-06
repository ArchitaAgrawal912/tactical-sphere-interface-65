import { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, ChevronDown, Cpu, Radio, Activity, Users, Zap } from "lucide-react";

const Helmet3D = lazy(() => import("@/components/Helmet3D"));

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
    { value: "99.7%", label: "Accuracy", icon: Activity },
    { value: "<50ms", label: "Response", icon: Zap },
    { value: "24/7", label: "Monitoring", icon: Eye },
    { value: "500+", label: "Sites Active", icon: Users },
  ];

  const features = [
    {
      icon: Eye,
      title: "Computer Vision",
      description: "Real-time hazard detection with 60 FPS neural processing across your entire facility.",
      stat: "60 FPS",
    },
    {
      icon: Cpu,
      title: "Edge Computing",
      description: "On-device AI processing ensures sub-50ms response times for critical alerts.",
      stat: "<50ms",
    },
    {
      icon: Radio,
      title: "IoT Wearables",
      description: "Lightweight smart modules track worker vitals and environmental conditions.",
      stat: "<60g",
    },
  ];

  return (
    <AnimatePresence>
      {!isBooting && (
        <motion.div
          className="min-h-screen bg-background relative overflow-hidden"
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
        >
          {/* Subtle gradient background */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-teal/5 to-transparent" />
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-amber/3 to-transparent" />
          </div>

          {/* Navigation */}
          <motion.nav
            className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 lg:px-20 py-5"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal/10 border border-teal/20 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-teal" />
                </div>
                <span className="font-semibold text-foreground tracking-tight">
                  Guardian<span className="text-teal">Vision</span>
                </span>
              </div>
              <div className="hidden md:flex items-center gap-8">
                <a href="#technology" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Technology</a>
                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                <button 
                  onClick={handleBoot}
                  className="px-5 py-2 bg-teal text-background font-medium text-sm rounded-lg hover:bg-teal-glow transition-colors"
                >
                  Launch Demo
                </button>
              </div>
            </div>
          </motion.nav>

          {/* Hero Section */}
          <main className="relative z-10 min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-20 pt-20">
            <div className="max-w-7xl mx-auto w-full">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-4 items-center">
                {/* Left content */}
                <motion.div 
                  className="space-y-8 order-2 lg:order-1"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  {/* Badge */}
                  <motion.div
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-steel/50 border border-border rounded-full"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                    <span className="text-xs font-medium text-muted-foreground tracking-wide">Industrial Safety IoT Platform</span>
                  </motion.div>

                  {/* Headline with gradient */}
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                    <span className="bg-gradient-to-r from-foreground via-foreground to-teal bg-clip-text text-transparent">
                      Safety is No Longer
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-teal to-teal-glow bg-clip-text text-transparent">
                      a Blind Spot.
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
                    A unified safety ecosystem combining <span className="text-foreground font-medium">Computer Vision</span> for 
                    facility-wide monitoring and <span className="text-foreground font-medium">Smart IoT</span> for individual worker protection.
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <motion.button
                      onClick={handleBoot}
                      className="group flex items-center gap-2 px-6 py-3 bg-teal text-background font-semibold rounded-lg hover:bg-teal-glow transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Eye className="w-4 h-4" />
                      View Live Demo
                    </motion.button>
                    <button 
                      onClick={() => document.getElementById('technology')?.scrollIntoView({ behavior: 'smooth' })}
                      className="px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-steel/50 transition-all"
                    >
                      Learn More
                    </button>
                  </div>

                  {/* Stats Row */}
                  <motion.div 
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-border"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    {stats.map((stat) => (
                      <div key={stat.label} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <stat.icon className="w-4 h-4 text-teal/60" />
                          <span className="text-2xl font-mono font-semibold text-foreground">{stat.value}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Right - 3D Helmet */}
                <motion.div
                  className="relative flex items-center justify-center order-1 lg:order-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <Suspense fallback={
                    <div className="w-full h-[500px] flex items-center justify-center">
                      <div className="w-16 h-16 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />
                    </div>
                  }>
                    <Helmet3D />
                  </Suspense>
                  
                  {/* Label */}
                  <motion.div 
                    className="absolute right-4 top-1/4 flex items-center gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                  >
                    <div className="w-12 h-px bg-border" />
                    <div className="px-3 py-1.5 bg-steel/80 border border-border rounded-md">
                      <span className="text-xs font-mono text-muted-foreground">Guardian Module</span>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Scroll indicator */}
              <motion.div 
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <span className="text-xs text-muted-foreground">Scroll to explore</span>
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              </motion.div>
            </div>
          </main>

          {/* Technology Section */}
          <section id="technology" className="relative z-10 px-6 md:px-12 lg:px-20 py-24 lg:py-32">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="grid lg:grid-cols-2 gap-16 items-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="space-y-6">
                  <span className="text-sm font-mono text-teal">01 — TECHNOLOGY</span>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                    AI-Powered <span className="text-teal">Protection</span>
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our neural network processes 60 frames per second, identifying potential hazards 
                    before they become incidents. Edge computing ensures sub-50ms response times for critical situations.
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="p-4 bg-steel/30 border border-border rounded-lg">
                      <p className="text-2xl font-mono font-bold text-teal">99.7%</p>
                      <p className="text-sm text-muted-foreground mt-1">Detection Accuracy</p>
                    </div>
                    <div className="p-4 bg-steel/30 border border-border rounded-lg">
                      <p className="text-2xl font-mono font-bold text-amber">24/7</p>
                      <p className="text-sm text-muted-foreground mt-1">Active Monitoring</p>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-video bg-steel/20 rounded-xl border border-border overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="w-14 h-14 mx-auto rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center">
                          <Eye className="w-6 h-6 text-teal" />
                        </div>
                        <p className="text-sm text-muted-foreground">Live Vision Feed</p>
                      </div>
                    </div>
                    {/* Subtle grid overlay */}
                    <div className="absolute inset-0 opacity-30" style={{
                      backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                                       linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
                      backgroundSize: '40px 40px'
                    }} />
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="relative z-10 px-6 md:px-12 lg:px-20 py-24 lg:py-32 border-t border-border">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-sm font-mono text-teal">02 — FEATURES</span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 tracking-tight">
                  Complete Safety <span className="text-amber">Ecosystem</span>
                </h2>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                  An integrated platform that combines cutting-edge technology with intuitive design.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    className="group p-6 bg-steel/20 border border-border rounded-xl hover:border-teal/30 transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-teal/10 border border-teal/20 flex items-center justify-center">
                        <feature.icon className="w-5 h-5 text-teal" />
                      </div>
                      <span className="text-xl font-mono font-bold text-teal">{feature.stat}</span>
                    </div>
                    <h3 className="font-semibold text-foreground text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="relative z-10 px-6 md:px-12 lg:px-20 py-24 lg:py-32">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
                Ready to Eliminate <span className="text-teal">Blind Spots</span>?
              </h2>
              <p className="text-muted-foreground mb-8">
                Experience the future of industrial safety with our live demonstration dashboard.
              </p>
              <motion.button
                onClick={handleBoot}
                className="px-8 py-4 bg-teal text-background font-semibold rounded-lg hover:bg-teal-glow transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Launch Live Demo
              </motion.button>
            </motion.div>
          </section>

          {/* Footer */}
          <footer className="relative z-10 px-6 md:px-12 lg:px-20 py-8 border-t border-border">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-teal/60" />
                <span className="text-sm text-muted-foreground">
                  GuardianVision © 2024
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
