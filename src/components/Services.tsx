import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Server, Zap, Cpu, HardDrive, Shield, Headphones } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { StaggeredGrid } from "./StaggeredGrid";
import { TiltCard } from "./TiltCard";
import { ParagraphReveal } from "./TextReveal";

const Services = () => {
  const navigate = useNavigate();
  
  const services = [
    {
      icon: Monitor,
      title: "Cloud RDP",
      subtitle: "Remote Desktop Solutions",
      description: "Enterprise-grade Windows environments with full administrative access. Perfect for remote work, development, and business applications.",
      features: [
        { icon: Zap, text: "High-performance virtual desktops", animate: "pulse" },
        { icon: Shield, text: "Secure Windows Server environments", animate: "shield" },
        { icon: Headphones, text: "24/7 Support - Always Here", animate: "bounce" },
        { icon: Cpu, text: "Full admin access included", animate: "spin" }
      ],
      price: "$9.99",
      period: "/month",
      highlight: "Most Popular"
    },
    {
      icon: Server,
      title: "VPS Hosting",
      subtitle: "Virtual Private Servers",
      description: "Powerful, scalable cloud servers with dedicated resources. Ideal for developers, businesses, and enterprise applications.",
      features: [
        { icon: HardDrive, text: "NVMe SSD storage", animate: "pulse" },
        { icon: Monitor, text: "Multiple OS options", animate: "spin" },
        { icon: Shield, text: "Root access & full control", animate: "shield" },
        { icon: Zap, text: "Scalable resources on-demand", animate: "bounce" }
      ],
      price: "$4.99",
      period: "/month",
      highlight: "Best Value"
    }
  ];

  const handleFeatureClick = () => {
    navigate('/auth');
  };

  return (
    <section id="services" className="py-12 sm:py-16 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 aurora-bg opacity-40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-beam opacity-50" />

      <div className="container mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-8 sm:mb-12 lg:mb-20"
        >
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 mb-3 sm:mb-5 text-[10px] sm:text-xs font-semibold text-primary bg-primary/10 rounded-full border border-primary/20 tracking-wide">
              Our Services
            </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-6 tracking-tight">
                Premium Cloud Infrastructure
              </h2>
              <ParagraphReveal className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2 sm:px-0" delay={0.2}>
              Deploy high-performance servers in seconds. Enterprise-grade reliability with 99.9% uptime guarantee.
            </ParagraphReveal>
        </motion.div>
        
        <StaggeredGrid 
          className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5 lg:gap-8 max-w-5xl mx-auto"
          staggerDelay={0.2}
        >
          {services.map((service, index) => (
            <TiltCard key={index} className="h-full" tiltAmount={6}>
              <Card 
                className="bg-gradient-card backdrop-blur-xl border-glass hover:border-primary/50 transition-all duration-700 hover:shadow-luxury group cursor-pointer relative overflow-hidden h-full flex flex-col"
              >
                {service.highlight && (
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20">
                    <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-semibold bg-gradient-primary text-primary-foreground rounded-full shadow-glow">
                      {service.highlight}
                    </span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-700"></div>
                <div className="absolute -inset-1 bg-gradient-primary opacity-0 group-hover:opacity-15 blur-xl transition-opacity duration-700"></div>
                
                <CardHeader className="pb-2 sm:pb-4 relative z-10 p-3 sm:p-5 lg:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-primary rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 shadow-glow flex-shrink-0">
                        <service.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg lg:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-500 mb-0.5">
                          {service.title}
                        </CardTitle>
                        <p className="text-xs sm:text-sm text-primary/80 font-medium">{service.subtitle}</p>
                      </div>
                    </div>
                    <CardDescription className="text-muted-foreground text-xs sm:text-sm lg:text-base leading-relaxed mt-3 sm:mt-4 group-hover:text-muted-foreground/90">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3 sm:space-y-5 relative z-10 flex-1 flex flex-col pt-0 p-3 sm:p-5 lg:p-6">
                  <div className="flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2.5">
                      {service.features.map((feature, idx) => {
                        const animationClass = 
                          feature.animate === "pulse" ? "group-hover:animate-pulse" :
                          feature.animate === "bounce" ? "group-hover:animate-bounce" :
                          feature.animate === "spin" ? "group-hover:animate-spin" :
                          feature.animate === "shield" ? "group-hover:scale-125" : "";
                        
                          return (
                            <motion.button 
                              key={idx}
                              onClick={handleFeatureClick}
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "200px 0px -50px 0px", amount: 0 }}
                              transition={{ delay: idx * 0.1, duration: 0.3 }}
                              whileHover={{ scale: 1.02, x: 5 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-md sm:rounded-xl bg-secondary/30 border border-glass group-hover:border-primary/20 transition-all duration-300 hover:bg-primary/10 hover:border-primary/40 cursor-pointer text-left"
                            >
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-primary rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm transition-all duration-300 group-hover:shadow-glow">
                                <feature.icon className={`w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground transition-all duration-300 ${animationClass}`} />
                              </div>
                              <span className="text-xs sm:text-sm text-foreground/90 font-medium leading-tight">{feature.text}</span>
                            </motion.button>
                          );
                      })}
                    </div>
                  </div>
                  
                  <div className="pt-3 sm:pt-5 border-t border-glass mt-auto">
                      <div className="flex items-end justify-between mb-3 sm:mb-5">
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-0.5">Starting from</p>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-text-gradient bg-clip-text text-transparent">{service.price}</span>
                            <span className="text-muted-foreground text-xs sm:text-sm">{service.period}</span>
                          </div>
                        </div>
                      </div>
                    <Button 
                      className="w-full bg-gradient-primary text-primary-foreground hover:shadow-glow-shadow hover:scale-[1.02] transition-all duration-500 group-hover:shadow-luxury font-semibold py-5 sm:py-6 text-sm sm:text-base relative overflow-hidden"
                      onClick={() => { navigate('/pricing'); }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <span className="relative">View Plans</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TiltCard>
          ))}
        </StaggeredGrid>
      </div>
    </section>
  );
};

export default Services;
