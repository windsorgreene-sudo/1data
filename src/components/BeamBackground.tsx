import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const BeamBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  // Parallax transforms for different layers
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const y2 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y3 = useTransform(scrollY, [0, 1000], [0, 150]);
  const scale1 = useTransform(scrollY, [0, 500], [1, 1.2]);
  const opacity1 = useTransform(scrollY, [0, 600], [0.8, 0.3]);
  const rotate1 = useTransform(scrollY, [0, 1000], [0, 15]);
  const rotate2 = useTransform(scrollY, [0, 1000], [0, -10]);

  // Fixed transforms for array mapping to follow Rules of Hooks
  const beamTransforms = [
    useTransform(scrollY, [0, 1000], [0, 100]),
    useTransform(scrollY, [0, 1000], [0, 130]),
    useTransform(scrollY, [0, 1000], [0, 160]),
    useTransform(scrollY, [0, 1000], [0, 190]),
    useTransform(scrollY, [0, 1000], [0, 220]),
  ];

  const vBeamTransforms = [
    useTransform(scrollY, [0, 1000], [0, 80]),
    useTransform(scrollY, [0, 1000], [0, 100]),
    useTransform(scrollY, [0, 1000], [0, 120]),
  ];

  const particleTransforms = [
    useTransform(scrollY, [0, 1000], [0, 50]),
    useTransform(scrollY, [0, 1000], [0, 90]),
    useTransform(scrollY, [0, 1000], [0, 130]),
    useTransform(scrollY, [0, 1000], [0, 170]),
    useTransform(scrollY, [0, 1000], [0, 210]),
    useTransform(scrollY, [0, 1000], [0, 250]),
  ];

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Aurora gradient base with parallax */}
      <motion.div 
        className="absolute inset-0 aurora-bg"
        style={{ 
          y: y3,
          opacity: opacity1,
          scale: scale1,
        }}
      />
      
      {/* Floating geometric shapes with parallax */}
      <motion.div
        className="absolute w-32 h-32 border border-primary/20 rounded-lg"
        style={{
          top: '15%',
          left: '8%',
          y: y1,
          rotate: rotate1,
        }}
        animate={{ 
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <motion.div
        className="absolute w-24 h-24 border border-accent/15 rounded-full"
        style={{
          top: '60%',
          right: '12%',
          y: y2,
          rotate: rotate2,
        }}
        animate={{ 
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute w-16 h-16 border border-primary/10"
        style={{
          top: '35%',
          right: '25%',
          y: y1,
          rotate: rotate1,
        }}
      />
      
      {/* Animated beam lines with parallax */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-[2px] bg-gradient-beam will-change-transform"
          style={{
            top: `${15 + i * 18}%`,
            width: '40%',
            y: beamTransforms[i],
          }}
          initial={{ left: '-40%', opacity: 0 }}
          animate={{ 
            left: '140%', 
            opacity: [0, 0.8, 0.8, 0] 
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: i * 1.2,
            ease: "linear"
          }}
        />
      ))}
      
      {/* Vertical beams with parallax */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`v-${i}`}
          className="absolute w-[2px] bg-gradient-to-b from-transparent via-primary/60 to-transparent will-change-transform"
          style={{
            left: `${25 + i * 25}%`,
            height: '30%',
            y: vBeamTransforms[i],
          }}
          initial={{ top: '-30%', opacity: 0 }}
          animate={{ 
            top: '130%', 
            opacity: [0, 0.6, 0.6, 0] 
          }}
          transition={{
            duration: 5 + i * 0.8,
            repeat: Infinity,
            delay: i * 2,
            ease: "linear"
          }}
        />
      ))}
      
      {/* Glowing orbs with parallax - Layer 1 (slowest) */}
      <motion.div
        className="absolute w-96 h-96 rounded-full will-change-transform"
        style={{
          background: 'radial-gradient(circle, hsl(185 100% 50% / 0.15) 0%, transparent 70%)',
          top: '10%',
          left: '10%',
          y: y1,
          scale: scale1,
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Layer 2 (medium speed) */}
      <motion.div
        className="absolute w-80 h-80 rounded-full will-change-transform"
        style={{
          background: 'radial-gradient(circle, hsl(270 95% 65% / 0.12) 0%, transparent 70%)',
          bottom: '20%',
          right: '15%',
          y: y2,
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
      
      {/* Layer 3 (fastest) */}
      <motion.div
        className="absolute w-64 h-64 rounded-full will-change-transform"
        style={{
          background: 'radial-gradient(circle, hsl(220 100% 60% / 0.1) 0%, transparent 70%)',
          top: '40%',
          right: '30%',
          y: y3,
        }}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      {/* Additional floating particles with parallax */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 rounded-full bg-primary/30 will-change-transform"
          style={{
            top: `${10 + i * 15}%`,
            left: `${15 + i * 12}%`,
            y: particleTransforms[i],
          }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
      
      {/* Grid overlay with subtle parallax */}
      <motion.div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(185 100% 50%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(185 100% 50%) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          y: y3,
        }}
      />
    </div>
  );
};

export default BeamBackground;
