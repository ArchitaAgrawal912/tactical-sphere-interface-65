import { motion } from "framer-motion";

const HelmetIllustration = () => {
  return (
    <div className="relative w-full max-w-lg aspect-square">
      {/* Outer arc */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-cyan/30 rounded-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
      
      {/* Inner dashed arc */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] border border-dashed border-cyan/20 rounded-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      />

      {/* Helmet body */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <svg 
          width="280" 
          height="280" 
          viewBox="0 0 280 280" 
          fill="none" 
          className="drop-shadow-lg"
        >
          {/* Helmet dome */}
          <path 
            d="M70 160 Q70 80 140 60 Q210 80 210 160 L210 180 Q210 200 190 200 L90 200 Q70 200 70 180 Z"
            stroke="hsl(186 100% 50%)"
            strokeWidth="2"
            fill="none"
            className="drop-shadow-[0_0_10px_rgba(0,242,255,0.3)]"
          />
          
          {/* Visor */}
          <path 
            d="M85 130 Q85 110 140 100 Q195 110 195 130 L195 155 Q195 165 185 165 L95 165 Q85 165 85 155 Z"
            stroke="hsl(186 100% 50%)"
            strokeWidth="1.5"
            fill="hsl(186 100% 50% / 0.05)"
          />
          
          {/* Visor inner glow */}
          <path 
            d="M95 135 Q95 120 140 112 Q185 120 185 135 L185 150 Q185 155 180 155 L100 155 Q95 155 95 150 Z"
            stroke="hsl(186 100% 50% / 0.5)"
            strokeWidth="1"
            fill="none"
          />

          {/* Side module - left */}
          <rect 
            x="55" 
            y="140" 
            width="12" 
            height="25" 
            rx="3"
            stroke="hsl(45 100% 50%)"
            strokeWidth="1.5"
            fill="hsl(45 100% 50% / 0.1)"
          />
          
          {/* Side module - right (Guardian Module) */}
          <rect 
            x="213" 
            y="130" 
            width="18" 
            height="35" 
            rx="4"
            stroke="hsl(45 100% 50%)"
            strokeWidth="2"
            fill="hsl(45 100% 50% / 0.15)"
            className="drop-shadow-[0_0_8px_rgba(255,191,0,0.3)]"
          />
          
          {/* Module antenna */}
          <line 
            x1="222" 
            y1="130" 
            x2="222" 
            y2="115"
            stroke="hsl(45 100% 50%)"
            strokeWidth="1.5"
          />
          <circle 
            cx="222" 
            cy="112" 
            r="4"
            stroke="hsl(45 100% 50%)"
            strokeWidth="1.5"
            fill="hsl(45 100% 50% / 0.3)"
          />
          
          {/* Status indicator on module */}
          <circle 
            cx="222" 
            cy="155" 
            r="3"
            fill="hsl(142 76% 42%)"
            className="animate-pulse"
          />

          {/* Chin guard */}
          <path 
            d="M90 200 L90 215 Q90 225 100 225 L180 225 Q190 225 190 215 L190 200"
            stroke="hsl(186 100% 50%)"
            strokeWidth="1.5"
            fill="none"
          />
          
          {/* Vent lines */}
          <line x1="110" y1="205" x2="110" y2="220" stroke="hsl(186 100% 50% / 0.4)" strokeWidth="1" />
          <line x1="130" y1="205" x2="130" y2="220" stroke="hsl(186 100% 50% / 0.4)" strokeWidth="1" />
          <line x1="150" y1="205" x2="150" y2="220" stroke="hsl(186 100% 50% / 0.4)" strokeWidth="1" />
          <line x1="170" y1="205" x2="170" y2="220" stroke="hsl(186 100% 50% / 0.4)" strokeWidth="1" />
        </svg>
      </motion.div>

      {/* Connection line to label */}
      <motion.div 
        className="absolute top-[38%] right-[5%] flex items-center gap-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="w-12 h-px bg-gradient-to-r from-transparent to-cyan/60" />
        <div className="flex flex-col items-start">
          <div className="w-2 h-2 bg-cyan rounded-full mb-1 animate-pulse" />
          <span className="text-xs font-mono text-cyan/80 whitespace-nowrap">Guardian Module</span>
        </div>
      </motion.div>

      {/* Secondary label - Visor */}
      <motion.div 
        className="absolute top-[45%] left-[5%] flex items-center gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="flex flex-col items-end">
          <span className="text-xs font-mono text-cyan/60 whitespace-nowrap">AR Display</span>
        </div>
        <div className="w-8 h-px bg-gradient-to-l from-transparent to-cyan/40" />
      </motion.div>

      {/* Scanning effect */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-[95%] rounded-full border border-cyan/10"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0, 0.3]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default HelmetIllustration;
