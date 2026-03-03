import { useRef, ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltAmount?: number;
  glareEnabled?: boolean;
}

export const TiltCard = ({ 
  children, 
  className = "", 
  tiltAmount = 10,
  glareEnabled = true 
}: TiltCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [tiltAmount, -tiltAmount]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-tiltAmount, tiltAmount]), {
    stiffness: 300,
    damping: 30,
  });
  
  const glareX = useSpring(useTransform(mouseX, [0, 1], [0, 100]), {
    stiffness: 300,
    damping: 30,
  });
    const glareY = useSpring(useTransform(mouseY, [0, 1], [0, 100]), {
      stiffness: 300,
      damping: 30,
    });

    const glareBackground = useTransform(
      [glareX, glareY],
      ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`
    );

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
        rotateX,
        rotateY,
      }}
    >
      {children}
      
        {/* Glare effect overlay */}
        {glareEnabled && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: glareBackground,
            }}
          />
        )}
    </motion.div>
  );
};

export default TiltCard;
