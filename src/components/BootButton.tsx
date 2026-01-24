import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Power } from "lucide-react";

interface BootButtonProps {
  onBoot: () => void;
}

const BootButton = ({ onBoot }: BootButtonProps) => {
  const [isBooting, setIsBooting] = useState(false);

  const handleClick = () => {
    setIsBooting(true);
    setTimeout(() => {
      onBoot();
    }, 2500);
  };

  return (
    <AnimatePresence mode="wait">
      {!isBooting ? (
        <motion.button
          key="boot-button"
          onClick={handleClick}
          className="boot-button group flex items-center gap-4 text-cyan"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Power className="w-6 h-6 transition-all group-hover:drop-shadow-[0_0_10px_rgba(0,242,255,0.8)]" />
          <span className="text-sm tracking-[0.3em]">Initialize System</span>
        </motion.button>
      ) : (
        <motion.div
          key="boot-sequence"
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative w-64 h-2 bg-obsidian-light rounded-sm overflow-hidden glow-border-cyan">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan to-cyan-glow"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>
          <motion.p
            className="terminal-text text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            INITIALIZING TACTICAL SPHERE v3.7.2...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BootButton;
