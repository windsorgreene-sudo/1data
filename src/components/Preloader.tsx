import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Server } from "lucide-react";

interface PreloaderProps {
  onComplete?: () => void;
}

const Preloader = ({ onComplete }: PreloaderProps) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const duration = 400;
    const interval = 16;
    const increment = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setIsComplete(true);
          onComplete?.();
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                style={{
                  top: `${20 + i * 15}%`,
                  width: '60%',
                }}
                initial={{ left: '-60%', opacity: 0 }}
                animate={{ 
                  left: '100%', 
                  opacity: [0, 0.6, 0] 
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "linear"
                }}
              />
            ))}
          </div>

          <motion.div
            className="relative mb-8"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "backOut" }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative flex items-center gap-3 px-6 py-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Server className="h-12 w-12 text-primary" />
              </motion.div>
              <span className="text-3xl font-bold gradient-text-animated">
                Beam Server
              </span>
            </div>
          </motion.div>

          <div className="w-64 md:w-80">
            <div className="relative h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
              <motion.div
                className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ left: ['-20%', '120%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
            
            <motion.div 
              className="mt-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-sm text-muted-foreground">
                Loading experience...
              </span>
              <motion.span 
                className="ml-2 text-sm font-mono text-primary"
                key={Math.floor(progress)}
              >
                {Math.floor(progress)}%
              </motion.span>
            </motion.div>
          </div>

          <div className="absolute bottom-20 flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary/60"
                animate={{
                  y: [-5, 5, -5],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
