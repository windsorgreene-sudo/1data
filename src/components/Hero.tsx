import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Shield, Clock, Zap, Server, Globe, Rocket } from "lucide-react";
import { useRef } from "react";
import BeamBackground from "./BeamBackground";
import MagneticWrapper from "./MagneticWrapper";
import ParticleBackground from "./ParticleBackground";

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
    layoutEffect: false
  });

  const contentY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const trustSignals = [
    { icon: Shield, label: "99.9% Uptime" },
    { icon: Zap, label: "Global Locations" },
    { icon: Clock, label: "Ultra-Low Latency" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <section id="home" ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 sm:pt-20 lg:pt-16">
      <BeamBackground />
      <ParticleBackground />
      
      <motion.div 
        className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8"
        style={{ y: shouldReduceMotion ? 0 : contentY, opacity }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-heavy mb-5 sm:mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] sm:text-xs font-medium text-muted-foreground tracking-wide uppercase">
                Next-Gen Cloud Infrastructure
              </span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-5 leading-[1.02] tracking-[-0.03em]" 
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span className="gradient-text-animated block">Blazing Fast Cloud</span>
              <span className="gradient-text-animated block">Servers & RDP</span>
              <span className="block text-base sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl text-muted-foreground/80 font-medium mt-3 sm:mt-4 tracking-[-0.01em]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                at the Speed of Light
              </span>
            </motion.h1>
            
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground/90 mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed font-[450]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Deploy high-performance VPS with NVMe storage and 10Gbps uplink in seconds. Premium infrastructure for elite performance.
            </motion.p>
            
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-8 sm:mb-10"
            >
              <MagneticWrapper strength={0.3}>
                <Button 
                  size="lg" 
                  variant="premium"
                  data-cursor="DEPLOY"
                  className="w-full sm:w-auto min-w-[160px] sm:min-w-[180px] lg:min-w-[200px] shadow-luxury group overflow-hidden h-11 sm:h-12 text-[13px] sm:text-sm font-semibold"
                  onClick={() => {
                    const el = document.getElementById('services');
                    const lenis = (window as any).__lenis;
                    if (lenis && el) lenis.scrollTo(el, { offset: -80, duration: 1.2 });
                    else el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Rocket className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  Deploy Server
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[25deg]" />
                </Button>
              </MagneticWrapper>
              
              <MagneticWrapper strength={0.3}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  data-cursor="EXPLORE"
                  className="w-full sm:w-auto min-w-[160px] sm:min-w-[180px] lg:min-w-[200px] border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-primary/40 transition-all duration-500 h-11 sm:h-12 text-[13px] sm:text-sm font-semibold"
                  onClick={() => {
                    const el = document.getElementById('global-map');
                    const lenis = (window as any).__lenis;
                    if (lenis && el) lenis.scrollTo(el, { offset: -80, duration: 1.2 });
                    else el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Globe className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  View Locations
                </Button>
              </MagneticWrapper>
            </motion.div>
            
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4 sm:gap-5 lg:gap-6 justify-center lg:justify-start"
            >
              {trustSignals.map((signal, index) => (
                <div key={index} className="flex items-center gap-2 text-muted-foreground">
                  <signal.icon className="h-4 w-4 text-primary" />
                  <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wider">{signal.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
          
          <motion.div
            variants={itemVariants}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <motion.div 
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 via-accent/10 to-transparent blur-3xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
              
              <div className="relative z-10 frosted-card rounded-2xl lg:rounded-3xl p-6 lg:p-8 h-full flex flex-col justify-center">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="relative mb-3 lg:mb-4 last:mb-0"
                  >
                    <div className="h-12 lg:h-14 bg-secondary/80 rounded-lg border border-glass flex items-center px-3 lg:px-4 gap-3">
                      <div className="flex gap-1">
                        <motion.div 
                          className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-primary"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1 + i * 0.2, repeat: Infinity }}
                        />
                        <motion.div 
                          className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-accent"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5 + i * 0.1, repeat: Infinity }}
                        />
                      </div>
                      <div className="flex-1 h-1 bg-gradient-to-r from-primary/40 via-accent/30 to-transparent rounded" />
                      <motion.div className="w-14 lg:w-16 h-2 bg-muted rounded overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-primary"
                          animate={{ width: ['20%', '80%', '40%', '90%', '20%'] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
                
                <div className="absolute -bottom-3 -right-3 lg:-bottom-4 lg:-right-4 glass-heavy rounded-xl p-3 lg:p-4 border border-glass shadow-2xl">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <Server className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
                    <div>
                      <p className="text-xl lg:text-2xl font-bold text-foreground">50+</p>
                      <p className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-widest">Global Hubs</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.div
                className="absolute top-1/2 -left-16 lg:-left-20 w-16 lg:w-20 h-[2px] bg-gradient-to-r from-transparent via-primary to-primary/50"
                animate={{ opacity: [0.3, 1, 0.3], x: [-10, 0, -10] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute top-1/3 -right-12 lg:-right-16 w-12 lg:w-16 h-[2px] bg-gradient-to-l from-transparent via-accent to-accent/50"
                animate={{ opacity: [0.5, 1, 0.5], x: [10, 0, 10] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
