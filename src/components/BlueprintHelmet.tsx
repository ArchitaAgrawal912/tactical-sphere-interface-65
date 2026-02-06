import { motion } from "framer-motion";

const BlueprintHelmet = () => {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center">
      {/* Ambient glow behind helmet */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 bg-teal/5 rounded-full blur-[100px]" />
      </div>

      {/* Floating helmet container */}
      <motion.div
        className="relative"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Blueprint SVG Helmet */}
        <svg
          viewBox="0 0 400 350"
          className="w-[380px] h-[330px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Grid pattern overlay */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(174 62% 56% / 0.05)" strokeWidth="0.5"/>
            </pattern>
            <linearGradient id="helmetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(174 62% 56% / 0.8)" />
              <stop offset="100%" stopColor="hsl(174 62% 56% / 0.4)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <rect width="400" height="350" fill="url(#grid)" />
          
          {/* Main helmet shell - outer line */}
          <motion.path
            d="M80 180 
               Q80 100, 200 80 
               Q320 100, 320 180 
               L320 220 
               Q320 260, 280 270 
               L120 270 
               Q80 260, 80 220 
               Z"
            stroke="url(#helmetGradient)"
            strokeWidth="2"
            fill="none"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          
          {/* Inner shell detail */}
          <motion.path
            d="M100 185 
               Q100 120, 200 100 
               Q300 120, 300 185 
               L300 215 
               Q300 245, 270 255 
               L130 255 
               Q100 245, 100 215 
               Z"
            stroke="hsl(174 62% 56% / 0.3)"
            strokeWidth="1"
            strokeDasharray="4 4"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
          />
          
          {/* Brim */}
          <motion.path
            d="M60 230 L340 230 L330 250 L70 250 Z"
            stroke="url(#helmetGradient)"
            strokeWidth="2"
            fill="hsl(174 62% 56% / 0.05)"
            filter="url(#glow)"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1, delay: 1 }}
          />
          
          {/* Camera module */}
          <motion.g
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            <rect x="85" y="195" width="45" height="35" rx="4" stroke="url(#helmetGradient)" strokeWidth="1.5" fill="hsl(174 62% 56% / 0.05)" />
            <circle cx="107" cy="212" r="10" stroke="hsl(174 62% 56% / 0.8)" strokeWidth="1.5" fill="none" />
            <circle cx="107" cy="212" r="5" fill="hsl(174 62% 56% / 0.3)" />
            {/* Camera LED */}
            <motion.circle
              cx="120" cy="200"
              r="3"
              fill="hsl(174 62% 56%)"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.g>
          
          {/* Sensor array on top */}
          <motion.g
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
          >
            {[0, 1, 2, 3].map((i) => (
              <motion.circle
                key={i}
                cx={170 + i * 20}
                cy="95"
                r="6"
                stroke="hsl(174 62% 56% / 0.6)"
                strokeWidth="1"
                fill="hsl(174 62% 56% / 0.1)"
                animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.g>
          
          {/* Side indicator lights */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <motion.rect
              x="290" y="180" width="20" height="8" rx="2"
              fill="hsl(174 62% 56%)"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.rect
              x="290" y="195" width="20" height="8" rx="2"
              fill="hsl(32 95% 65%)"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            />
          </motion.g>
          
          {/* Chin strap */}
          <motion.path
            d="M120 270 Q120 300, 150 310 L250 310 Q280 300, 280 270"
            stroke="hsl(174 62% 56% / 0.4)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 2.2 }}
          />
          
          {/* Dimension lines - blueprint style */}
          <motion.g
            stroke="hsl(174 62% 56% / 0.2)"
            strokeWidth="0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
          >
            {/* Width dimension */}
            <line x1="60" y1="290" x2="340" y2="290" />
            <line x1="60" y1="285" x2="60" y2="295" />
            <line x1="340" y1="285" x2="340" y2="295" />
            <text x="200" y="305" fill="hsl(174 62% 56% / 0.4)" fontSize="10" textAnchor="middle" fontFamily="monospace">280mm</text>
            
            {/* Height dimension */}
            <line x1="355" y1="80" x2="355" y2="270" />
            <line x1="350" y1="80" x2="360" y2="80" />
            <line x1="350" y1="270" x2="360" y2="270" />
            <text x="370" y="180" fill="hsl(174 62% 56% / 0.4)" fontSize="10" textAnchor="middle" fontFamily="monospace" transform="rotate(90 370 180)">190mm</text>
          </motion.g>
          
          {/* Technical labels */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.8 }}
          >
            <text x="50" y="210" fill="hsl(174 62% 56% / 0.5)" fontSize="8" fontFamily="monospace">CAM-01</text>
            <text x="280" y="165" fill="hsl(174 62% 56% / 0.5)" fontSize="8" fontFamily="monospace">LED-STAT</text>
            <text x="165" y="85" fill="hsl(174 62% 56% / 0.5)" fontSize="8" fontFamily="monospace">SENSOR-ARRAY</text>
          </motion.g>
        </svg>

        {/* Scanning laser line */}
        <motion.div
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal to-transparent opacity-60"
          initial={{ top: "10%" }}
          animate={{ top: ["10%", "90%", "10%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Floating data labels */}
      <motion.div
        className="absolute left-0 top-1/4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 3 }}
      >
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-steel/60 border border-border/50 rounded backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <motion.div 
                className="w-1.5 h-1.5 rounded-full bg-teal"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-[10px] font-mono text-muted-foreground">AI Vision Active</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute right-0 top-1/3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 3.2 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-px bg-border/50" />
          <div className="px-3 py-1.5 bg-steel/60 border border-border/50 rounded backdrop-blur-sm">
            <p className="text-[10px] font-mono text-teal">5 Sensors</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute left-4 bottom-1/4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 3.4 }}
      >
        <div className="px-3 py-1.5 bg-steel/60 border border-border/50 rounded backdrop-blur-sm">
          <p className="text-[10px] font-mono text-amber">IoT Ready</p>
        </div>
      </motion.div>

      <motion.div
        className="absolute right-4 bottom-1/3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 3.6 }}
      >
        <div className="px-3 py-2 bg-steel/60 border border-border/50 rounded backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div>
              <p className="text-[9px] text-muted-foreground">Weight</p>
              <p className="text-xs font-mono text-foreground">&lt;60g</p>
            </div>
            <div className="w-px h-6 bg-border/30" />
            <div>
              <p className="text-[9px] text-muted-foreground">Battery</p>
              <p className="text-xs font-mono text-teal">12h</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BlueprintHelmet;
