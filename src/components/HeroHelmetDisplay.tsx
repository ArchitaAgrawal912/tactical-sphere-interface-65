import { motion } from "framer-motion";
import helmetImage from "@/assets/helmet-isolated.png";

const HeroHelmetDisplay = () => {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 bg-teal/10 rounded-full blur-[120px]" />
      </div>

      {/* Decorative rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          className="w-[350px] h-[350px] border border-teal/15 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute w-[420px] h-[420px] border border-dashed border-border rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Main helmet image */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.img
          src={helmetImage}
          alt="Smart Safety Helmet with integrated sensors and AI monitoring"
          className="w-full max-w-md object-contain drop-shadow-2xl"
          animate={{ 
            y: [0, -8, 0],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />

        {/* Scanning line effect */}
        <motion.div
          className="absolute left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-teal/60 to-transparent rounded-full"
          animate={{ top: ["20%", "80%", "20%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Floating data indicators */}
      <motion.div
        className="absolute left-4 top-1/3 flex items-center gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="px-3 py-2 bg-steel/80 border border-border rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground">Camera Active</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute right-4 top-1/2 flex items-center gap-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="w-10 h-px bg-border" />
        <div className="px-3 py-2 bg-steel/80 border border-border rounded-lg backdrop-blur-sm">
          <p className="text-xs font-mono text-teal">Sensors Online</p>
          <p className="text-[10px] text-muted-foreground">5 Active</p>
        </div>
      </motion.div>

      <motion.div
        className="absolute left-8 bottom-1/4 flex items-center gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2 }}
      >
        <div className="px-3 py-2 bg-steel/80 border border-border rounded-lg backdrop-blur-sm">
          <p className="text-xs font-mono text-amber">IoT Connected</p>
          <p className="text-[10px] text-muted-foreground">Real-time sync</p>
        </div>
      </motion.div>

      {/* Vitals indicator */}
      <motion.div
        className="absolute right-8 bottom-1/3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
      >
        <div className="px-3 py-2 bg-steel/80 border border-border rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground">Heart Rate</p>
              <p className="text-sm font-mono text-teal">72 BPM</p>
            </div>
            <div className="w-12 h-6 flex items-end gap-0.5">
              {[40, 60, 30, 80, 50, 70, 45].map((h, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-teal/60 rounded-full"
                  style={{ height: `${h}%` }}
                  animate={{ height: [`${h}%`, `${h + 20}%`, `${h}%`] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroHelmetDisplay;
