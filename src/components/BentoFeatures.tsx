import { motion } from "framer-motion";
import { Gauge, Layers, Headphones, Cpu, CheckCircle2, ArrowRight } from "lucide-react";
import { StaggeredGrid } from "./StaggeredGrid";
import { Card, CardContent } from "@/components/ui/card";

const BentoFeatures = () => {
  
  const features = [
    {
      icon: Gauge,
      title: "NVMe SSD Storage",
      description: "Lightning-fast read speeds up to 7,000 MB/s with enterprise-grade NVMe SSDs for instant data access.",
      className: "sm:col-span-1 lg:col-span-1",
      tag: "High Performance",
      stats: "7,000 MB/s",
      gradient: "from-cyan-500 to-blue-600"
    },
    {
      icon: Layers,
      title: "Instant Scaling",
      description: "Scale your resources up or down instantly with zero downtime. Pay only for what you use.",
      className: "sm:col-span-1 lg:col-span-1",
      tag: "Flexible",
      stats: "0ms Downtime",
      gradient: "from-pink-500 to-rose-600"
    },
    {
      icon: Headphones,
      title: "24/7 Expert Support",
      description: "Round-the-clock technical support from certified engineers via chat, email, and phone.",
      className: "sm:col-span-1 lg:col-span-1",
      tag: "Reliable",
      stats: "< 5 min Response",
      gradient: "from-amber-500 to-yellow-600"
    },
    {
      icon: Cpu,
      title: "Latest Gen Processors",
      description: "AMD EPYC & Intel Xeon processors with high core counts and clock speeds for demanding workloads.",
      className: "sm:col-span-1 lg:col-span-1",
      tag: "Powerful",
      stats: "Up to 128 cores",
      gradient: "from-violet-500 to-purple-600"
    },
  ];

  return (
    <section id="features" className="relative py-10 sm:py-14 md:py-24 overflow-hidden bg-background">
      <div className="absolute inset-0 aurora-bg opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[150px] sm:w-[250px] md:w-[450px] h-[150px] sm:h-[250px] md:h-[450px] bg-primary/10 blur-[60px] sm:blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[150px] sm:w-[250px] md:w-[450px] h-[150px] sm:h-[250px] md:h-[450px] bg-accent/10 blur-[60px] sm:blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-3 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12 md:mb-20"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-5">
            <span className="relative flex h-1 w-1 sm:h-2 sm:w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1 w-1 sm:h-2 sm:w-2 bg-primary"></span>
            </span>
            Infrastructure
          </div>
          
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-6 tracking-tight">
                <span className="block text-foreground">Enterprise-Grade</span>
                <span className="gradient-text-animated">Infrastructure</span>
              </h2>
              
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
              Powered by cutting-edge technology and optimized global networking to deliver unmatched performance.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`${feature.className} group`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                  <Card 
                    className="h-full bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden"
                  >
                  <CardContent className="p-3 sm:p-5 lg:p-8 relative">
                    <div className={`absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r ${feature.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
                    
                      <div className="flex items-start justify-between mb-3 sm:mb-6">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                          <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                        </div>
                        <span className="text-xs sm:text-xs font-bold text-primary bg-primary/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                          {feature.stats}
                        </span>
                      </div>
                      
                      <div className="mb-2 sm:mb-4">
                        <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-white/5 border border-white/10 text-[9px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider group-hover:text-primary group-hover:border-primary/30 transition-colors duration-300">
                          {feature.tag}
                        </span>
                      </div>
                      
                      <h3 className="text-sm sm:text-base lg:text-xl font-bold mb-1.5 sm:mb-4 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-3">
                        {feature.description}
                      </p>

                  <div className="mt-3 sm:mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-1.5 text-[7px] sm:text-[10px] font-medium text-muted-foreground">
                      <CheckCircle2 className="w-2 h-2 sm:w-3.5 sm:h-3.5 text-primary" />
                      <span>Available Now</span>
                    </div>
                    
                    <motion.div 
                      className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                      whileHover={{ scale: 1.1 }}
                    >
                      <ArrowRight className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-primary" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BentoFeatures;
