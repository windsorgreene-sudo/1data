import { Zap, Lock, Database, Server, Globe, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { ParallaxElement } from "./ParallaxBackground";
import { WaveGrid } from "./StaggeredGrid";
import { TiltCard } from "./TiltCard";

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "High-performance infrastructure with SSD storage and optimized networks for maximum speed."
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "Advanced encryption and secure data centers to keep your data safe."
    },
    {
      icon: Database,
      title: "Automated Backups",
      description: "Daily automated backups with one-click restore. Never worry about data loss again."
    },
    {
      icon: Server,
      title: "Dedicated Resources",
      description: "No sharing, no throttling. Get guaranteed CPU, RAM, and storage just for you."
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Worldwide data centers and proxy locations for optimal performance and coverage."
    },
    {
      icon: TrendingUp,
      title: "Scalable Resources",
      description: "Easily upgrade or downgrade your resources anytime to match your growing needs."
    }
  ];

  return (
    <section id="features" className="py-12 sm:py-16 lg:py-20 bg-gradient-surface relative overflow-hidden">
      {/* Premium Animated Background with Parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <ParallaxElement speed={0.18} direction="down">
          <div className="absolute top-1/3 right-1/4 w-36 h-36 bg-gradient-primary rounded-full opacity-6 animate-float blur-3xl"></div>
        </ParallaxElement>
        <ParallaxElement speed={0.22} direction="up">
          <div className="absolute bottom-1/3 left-1/4 w-28 h-28 bg-gradient-accent rounded-full opacity-8 animate-float-delayed blur-2xl"></div>
        </ParallaxElement>
        <ParallaxElement speed={0.12} direction="down">
          <div className="absolute top-2/3 right-1/3 w-32 h-32 bg-gradient-primary rounded-full opacity-4 animate-breathe blur-xl"></div>
        </ParallaxElement>
      </div>

      <div className="container mx-auto px-3 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-6 text-foreground">
              Why Choose <span className="bg-text-gradient bg-clip-text text-transparent animate-glow-pulse hover:scale-105 transition-transform duration-500 cursor-default inline-block">Beam Servers</span>
            </h2>
            <p className="text-[11px] sm:text-sm md:text-base lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
              Built for power users who demand the best in 
              <span className="text-primary font-semibold"> performance</span>, 
              <span className="text-accent font-semibold"> security</span>, and 
              <span className="text-primary font-semibold"> reliability</span>
            </p>
          </motion.div>
          
          <WaveGrid 
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-8 max-w-6xl mx-auto"
            columns={3}
            waveDelay={0.1}
          >
            {features.map((feature, index) => (
              <TiltCard key={index} className="h-full" tiltAmount={8}>
                <div 
                  className="group p-3 sm:p-5 lg:p-8 rounded-xl sm:rounded-2xl lg:rounded-3xl bg-gradient-card backdrop-blur-xl border-glass hover:border-primary/50 transition-all duration-700 hover:shadow-luxury cursor-pointer relative overflow-hidden h-full"
                >
                  <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-700"></div>
                  <div className="absolute -inset-1 bg-gradient-primary opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700"></div>
                  
                  <div className="relative z-10">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-primary rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 lg:mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-glow">
                      <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-8 lg:h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xs sm:text-sm lg:text-xl font-bold text-foreground mb-1.5 sm:mb-2 lg:mb-4 group-hover:text-primary transition-colors duration-500">{feature.title}</h3>
                    <p className="text-[10px] sm:text-xs lg:text-base text-muted-foreground leading-relaxed group-hover:text-foreground/90 transition-colors duration-500 line-clamp-3 sm:line-clamp-none">{feature.description}</p>
                  </div>
                </div>
              </TiltCard>
            ))}
          </WaveGrid>
      </div>
    </section>
  );
};

export default Features;
