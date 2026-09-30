import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useEffect, useState, memo, useRef, useCallback } from "react";

const CursorGlow = memo(() => {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [isClicking, setIsClicking] = useState(false);
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);
  const trailId = useRef(0);
  const lastTrailTime = useRef(0);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 35, stiffness: 800, mass: 0.1 };
  const outerConfig = { damping: 40, stiffness: 300, mass: 0.2 };
  const trailConfig = { damping: 50, stiffness: 400, mass: 0.15 };
  
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  
  const outerXSpring = useSpring(cursorX, outerConfig);
  const outerYSpring = useSpring(cursorY, outerConfig);

  const glowXSpring = useSpring(cursorX, trailConfig);
  const glowYSpring = useSpring(cursorY, trailConfig);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const addTrail = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastTrailTime.current < 20) return;
    lastTrailTime.current = now;
    
    const id = trailId.current++;
    setTrail(prev => [...prev.slice(-8), { x, y, id }]);
    
    setTimeout(() => {
      setTrail(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      addTrail(e.clientX, e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest('button, a, [role="button"], .cursor-pointer, input, textarea, select');
      setIsHovering(!!interactive);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', moveCursor, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, isMobile, isVisible, addTrail]);

  if (isMobile) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999]" style={{ willChange: 'transform' }}>
      {trail.map((point, index) => (
        <motion.div
          key={point.id}
          initial={{ opacity: 0.5, scale: 1 }}
          animate={{ opacity: 0, scale: 0.2 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed rounded-full"
          style={{
            left: point.x,
            top: point.y,
            width: 6,
            height: 6,
            transform: 'translate(-50%, -50%) translateZ(0)',
            background: `radial-gradient(circle, hsl(${185 + index * 10} 100% 65% / 0.7), transparent)`,
            filter: 'blur(1px)',
            willChange: 'transform, opacity',
          }}
        />
      ))}

      <motion.div
        className="fixed rounded-full"
        style={{
          x: outerXSpring,
          y: outerYSpring,
          translateX: '-50%',
          translateY: '-50%',
          willChange: 'transform',
        }}
      >
        <motion.div
          animate={{
            width: isHovering ? 60 : 40,
            height: isHovering ? 60 : 40,
            opacity: isVisible ? 1 : 0,
            scale: isClicking ? 0.85 : 1,
            rotate: isHovering ? 180 : 0,
          }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 30,
            rotate: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
          }}
          style={{
            background: `conic-gradient(from 0deg, 
              hsl(185 100% 50% / 0.5), 
              hsl(220 100% 55% / 0.3), 
              hsl(270 95% 60% / 0.5), 
              hsl(320 90% 55% / 0.3),
              hsl(185 100% 50% / 0.5)
            )`,
            borderRadius: '50%',
            padding: 2,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            willChange: 'transform, width, height',
          }}
        />
      </motion.div>

      <motion.div
        className="fixed rounded-full"
        style={{
          x: outerXSpring,
          y: outerYSpring,
          translateX: '-50%',
          translateY: '-50%',
          willChange: 'transform',
        }}
      >
        <motion.div
          animate={{
            width: isHovering ? 80 : 55,
            height: isHovering ? 80 : 55,
            opacity: isVisible ? 0.25 : 0,
            scale: isClicking ? 0.9 : 1,
            rotate: isHovering ? -90 : 0,
          }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          style={{
            border: '1px dashed hsl(185 100% 50% / 0.2)',
            borderRadius: '50%',
            willChange: 'transform, width, height',
          }}
        />
      </motion.div>

      <motion.div
        className="fixed"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
          willChange: 'transform',
        }}
      >
        <motion.div 
          animate={{
            width: isHovering ? 14 : 8,
            height: isHovering ? 14 : 8,
            scale: isClicking ? 0.6 : 1,
            opacity: isVisible ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
          className="relative"
          style={{
            background: 'linear-gradient(135deg, hsl(185 100% 55%), hsl(270 95% 65%))',
            borderRadius: '50%',
            boxShadow: `
              0 0 15px hsl(185 100% 50% / 0.8),
              0 0 30px hsl(270 95% 65% / 0.5),
              0 0 45px hsl(185 100% 50% / 0.25),
              inset 0 0 8px hsl(0 0% 100% / 0.3)
            `,
            willChange: 'transform, width, height',
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              background: 'radial-gradient(circle, hsl(185 100% 70% / 0.35), transparent 70%)',
            }}
          />
        </motion.div>
      </motion.div>

      <motion.div
        className="fixed"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
          willChange: 'transform',
        }}
      >
        <motion.div
          animate={{
            width: isHovering ? 24 : 18,
            height: isHovering ? 24 : 18,
            opacity: isVisible ? 0.5 : 0,
            scale: isClicking ? 0.7 : 1,
          }}
          transition={{ type: "spring", stiffness: 600, damping: 28 }}
          style={{
            border: '1px solid hsl(185 100% 60% / 0.4)',
            borderRadius: '50%',
            boxShadow: '0 0 12px hsl(185 100% 50% / 0.25)',
            willChange: 'transform, width, height',
          }}
        />
      </motion.div>

      <AnimatePresence>
        {isClicking && (
          <>
            <motion.div
              key="click-wave-1"
              initial={{ opacity: 0.7, scale: 0.5 }}
              animate={{ opacity: 0, scale: 2.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed rounded-full"
              style={{
                left: cursorX.get(),
                top: cursorY.get(),
                width: 18,
                height: 18,
                transform: 'translate(-50%, -50%) translateZ(0)',
                border: '2px solid hsl(185 100% 50% / 0.5)',
                boxShadow: '0 0 15px hsl(185 100% 50% / 0.35)',
                willChange: 'transform, opacity',
              }}
            />
            <motion.div
              key="click-wave-2"
              initial={{ opacity: 0.5, scale: 0.3 }}
              animate={{ opacity: 0, scale: 2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
              className="fixed rounded-full"
              style={{
                left: cursorX.get(),
                top: cursorY.get(),
                width: 14,
                height: 14,
                transform: 'translate(-50%, -50%) translateZ(0)',
                background: 'radial-gradient(circle, hsl(270 95% 65% / 0.4), transparent)',
                willChange: 'transform, opacity',
              }}
            />
          </>
        )}
      </AnimatePresence>

      <motion.div
        className="fixed pointer-events-none"
        style={{
          x: glowXSpring,
          y: glowYSpring,
          translateX: '-50%',
          translateY: '-50%',
          willChange: 'transform',
        }}
      >
        <motion.div
          animate={{
            width: 100,
            height: 100,
            opacity: isVisible ? 0.12 : 0,
          }}
          style={{
            background: `radial-gradient(circle, hsl(185 100% 50% / 0.25) 0%, hsl(270 95% 65% / 0.12) 40%, transparent 70%)`,
            borderRadius: '50%',
            filter: 'blur(15px)',
            willChange: 'opacity',
          }}
        />
      </motion.div>
    </div>
  );
});

export default CursorGlow;
