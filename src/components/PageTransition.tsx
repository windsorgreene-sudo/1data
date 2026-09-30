import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const PageTransition = ({ children, className = "w-full" }: PageTransitionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
    exit={{ opacity: 0, y: -12, transition: { duration: 0.28, ease: [0.4, 0, 1, 1] } }}
    className={className}
  >
    {children}
  </motion.div>
);

export default PageTransition;
