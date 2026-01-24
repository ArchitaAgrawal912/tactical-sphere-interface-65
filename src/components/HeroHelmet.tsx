import { motion, useScroll, useTransform } from "framer-motion";
import helmetImage from "@/assets/helmet-hero.png";

const HeroHelmet = () => {
  const { scrollY } = useScroll();
  const rotateY = useTransform(scrollY, [0, 500], [0, 45]);
  const scale = useTransform(scrollY, [0, 500], [1, 0.7]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <motion.div
      className="relative w-[500px] h-[500px] mx-auto"
      style={{ rotateY, scale, opacity }}
    >
      {/* Glow effect behind helmet */}
      <div className="absolute inset-0 rounded-full bg-gradient-radial from-cyan/20 via-transparent to-transparent blur-3xl" />
      
      {/* Rotating ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-cyan/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Inner rotating ring */}
      <motion.div
        className="absolute inset-8 rounded-full border border-ember/20"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Helmet image */}
      <motion.img
        src={helmetImage}
        alt="Tactical Helmet"
        className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_60px_rgba(0,242,255,0.4)]"
        animate={{ 
          y: [0, -15, 0],
          rotateZ: [0, 2, 0, -2, 0]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      
      {/* Scan line effect */}
      <motion.div
        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan/50 to-transparent"
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Data points around helmet */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-cyan rounded-full"
          style={{
            top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 6)}%`,
            left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 6)}%`,
          }}
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            delay: i * 0.3 
          }}
        />
      ))}
    </motion.div>
  );
};

export default HeroHelmet;
