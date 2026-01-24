import { motion } from "framer-motion";

interface BrutalistHeaderProps {
  title: string;
  subtitle?: string;
  filled?: boolean;
}

const BrutalistHeader = ({ title, subtitle, filled = false }: BrutalistHeaderProps) => {
  const words = title.split(" ");

  return (
    <div className="relative">
      <motion.h1 
        className={`text-6xl md:text-8xl lg:text-9xl leading-none ${filled ? 'brutalist-header-filled' : 'brutalist-header'}`}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            className="inline-block mr-4"
            variants={{
              hidden: { opacity: 0, y: 50, rotateX: -90 },
              visible: { opacity: 1, y: 0, rotateX: 0 }
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {word}
          </motion.span>
        ))}
      </motion.h1>
      
      {subtitle && (
        <motion.p
          className="mt-6 text-lg md:text-xl text-muted-foreground font-mono tracking-wider"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};

export default BrutalistHeader;
