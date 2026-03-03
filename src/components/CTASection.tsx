import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Rocket, ArrowRight } from "lucide-react";
import { TextReveal, ParagraphReveal } from "./TextReveal";

const CTASection = () => {
  return (
    <section className="relative py-10 sm:py-14 md:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 aurora-bg" />
      
      <div className="relative z-10 container mx-auto px-3 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto"
        >
          {/* CTA Card */}
          <div className="relative rounded-xl sm:rounded-3xl overflow-hidden">
            {/* Gradient border effect */}
            <div className="absolute inset-0 bg-gradient-primary p-[1px] sm:p-[2px] rounded-xl sm:rounded-3xl">
              <div className="absolute inset-[1px] sm:inset-[2px] bg-card rounded-xl sm:rounded-3xl" />
            </div>
            
            {/* Content */}
            <div className="relative z-10 p-4 sm:p-8 md:p-12 lg:p-16 text-center">
              {/* Beam effects */}
              <motion.div
                className="absolute top-0 left-1/4 right-1/4 h-[1px] sm:h-[2px] bg-gradient-beam"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              <motion.div
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-3 sm:mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <Rocket className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span className="text-[10px] sm:text-sm text-primary font-medium">Power Your Digital Dreams</span>
              </motion.div>
              
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-8">
                    <TextReveal delay={0.2}>
                      Ready to Experience the
                    </TextReveal>
                    <span className="gradient-text">
                      <TextReveal delay={0.4}>Future of Cloud?</TextReveal>
                    </span>
                  </h2>
                  
                  <ParagraphReveal delay={0.6} className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-5 sm:mb-12 max-w-2xl mx-auto px-2 sm:px-0">
                  Join thousands of developers and businesses who trust Beam Server 
                  for their mission-critical applications.
                </ParagraphReveal>
              
              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-primary text-primary-foreground font-semibold px-6 sm:px-10 py-6 sm:py-7 text-sm sm:text-base md:text-lg group hover:shadow-glow transition-all duration-300"
                    onClick={() => window.open('https://wa.me/917701931693', '_blank')}
                  >
                    <Rocket className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:animate-bounce" />
                    Get Started Now
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-glass-hover bg-transparent text-foreground hover:bg-primary/10 px-6 sm:px-10 py-6 sm:py-7 text-sm sm:text-base md:text-lg font-semibold"
                    onClick={() => {
                      const pricingSection = document.getElementById('pricing');
                      pricingSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    View Pricing
                  </Button>
                </div>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-6 md:gap-8 mt-5 sm:mt-10 md:mt-12 pt-4 sm:pt-8 border-t border-glass">
                {[
                  "No credit card required",
                  "Free migration assistance", 
                  "Enterprise-grade security"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;