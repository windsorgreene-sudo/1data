import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
      transition={{ 
        duration: 0.6, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      style={{ willChange: "transform, opacity, filter" }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
