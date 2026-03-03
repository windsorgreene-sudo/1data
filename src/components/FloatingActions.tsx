import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { MessageCircle, ArrowUp, Headphones } from "lucide-react";

const FloatingActions = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      setShowWhatsApp(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    const lenis = (window as any).__lenis;
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const openWhatsApp = () => {
    const whatsappNumber = "+17788517393";
    const message = "Hi! I'm interested in your Cloud RDP/VPS services.";
    const url = `https://wa.me/${whatsappNumber.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-2 sm:gap-3">
      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <MagneticButton
            onClick={scrollToTop}
            onHoverStart={() => setHoveredButton("scroll")}
            onHoverEnd={() => setHoveredButton(null)}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-card/90 backdrop-blur-sm border border-border hover:border-primary/50 rounded-full flex items-center justify-center shadow-lg group"
            aria-label="Scroll to top"
          >
            <motion.div
              animate={hoveredButton === "scroll" ? { y: -2, rotate: 0 } : { y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.div>
            
            {/* Animated Tooltip - hide on mobile */}
            <span className="hidden sm:block">
              <AnimatedTooltip show={hoveredButton === "scroll"}>
                Back to top
              </AnimatedTooltip>
            </span>
          </MagneticButton>
        )}
      </AnimatePresence>

      {/* WhatsApp Button */}
      <AnimatePresence>
        {showWhatsApp && (
          <MagneticButton
            onClick={openWhatsApp}
            onHoverStart={() => setHoveredButton("whatsapp")}
            onHoverEnd={() => setHoveredButton(null)}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20BA5C] rounded-full flex items-center justify-center shadow-lg group relative overflow-visible"
            aria-label="Chat on WhatsApp"
          >
            {/* Pulse ring */}
            <motion.span
              className="absolute w-full h-full rounded-full bg-[#25D366]"
              animate={{ scale: [1, 1.4, 1.4], opacity: [0.4, 0, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            
            {/* Ripple on hover */}
            <AnimatePresence>
              {hoveredButton === "whatsapp" && (
                <motion.span
                  className="absolute w-full h-full rounded-full bg-white/20"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />
              )}
            </AnimatePresence>
            
            {/* Icon with elastic scale */}
            <motion.div
              className="relative z-10"
              animate={hoveredButton === "whatsapp" ? { scale: 1.1 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white" />
            </motion.div>
            
            {/* Animated Tooltip - hide on mobile */}
            <span className="hidden sm:block">
              <AnimatedTooltip show={hoveredButton === "whatsapp"}>
                Chat with us
              </AnimatedTooltip>
            </span>
          </MagneticButton>
        )}
      </AnimatePresence>
    </div>
  );
};

// Magnetic Button Component
interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  className?: string;
  "aria-label"?: string;
}

const MagneticButton = ({ 
  children, 
  onClick, 
  onHoverStart, 
  onHoverEnd, 
  className,
  "aria-label": ariaLabel
}: MagneticButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * 0.2;
    const deltaY = (e.clientY - centerY) * 0.2;
    
    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    onHoverEnd?.();
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={onHoverStart}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </motion.button>
  );
};

// Animated Tooltip Component
interface AnimatedTooltipProps {
  children: React.ReactNode;
  show: boolean;
}

const AnimatedTooltip = ({ children, show }: AnimatedTooltipProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          className="absolute right-full mr-3 bg-card text-foreground text-sm font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap border border-border pointer-events-none"
          initial={{ opacity: 0, x: 10, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 10, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {children}
          {/* Arrow */}
          <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-card border-r border-t border-border" />
        </motion.span>
      )}
    </AnimatePresence>
  );
};

export default FloatingActions;
