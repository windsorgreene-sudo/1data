import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check, Zap, Star, Crown, MessageCircle } from "lucide-react";
import { PopGrid } from "./StaggeredGrid";
import { TextReveal, ParagraphReveal } from "./TextReveal";

interface Plan {
  name: string;
  icon: typeof Zap;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  popular?: boolean;
  type: "rdp" | "vps" | "dedicated";
}

const plans: Plan[] = [
  {
    name: "RDP Starter",
    icon: Zap,
    monthlyPrice: 12,
    yearlyPrice: 120,
    description: "Perfect for remote work and light usage",
    type: "rdp",
    features: [
      "2 vCPU Cores",
      "4 GB RAM",
      "80 GB NVMe SSD",
      "1 Gbps Network",
      "Full Admin Access",
      "24/7 Support",
    ],
  },
  {
    name: "VPS Pro",
    icon: Star,
    monthlyPrice: 29,
    yearlyPrice: 290,
    description: "Ideal for developers and growing businesses",
    type: "vps",
    popular: true,
    features: [
        "4 vCPU Cores",
        "8 GB RAM",
        "160 GB NVMe SSD",
        "10 Gbps Network",
        "Full Root Access",
        "Automated Backups",
        "Root Access",
        "Priority Support",
    ],
  },
  {
    name: "Dedicated Power",
    icon: Crown,
    monthlyPrice: 79,
    yearlyPrice: 790,
    description: "Maximum power for enterprise workloads",
    type: "dedicated",
      features: [
        "8 Dedicated Cores",
        "32 GB RAM",
        "500 GB NVMe SSD",
        "10 Gbps Unmetered",
        "Dedicated Account Manager",
        "Daily Backups",
        "Private Network",
        "Dedicated Account Manager",
      ],
  },
];

const CountUp = ({ end, duration = 1 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const increment = end / (duration * 60);
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 1000 / 60);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return <span ref={ref}>{count}</span>;
};

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const handleOrder = (plan: Plan) => {
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    const billing = isYearly ? "yearly" : "monthly";
    const message = `Hi, I'm interested in the ${plan.name} plan ($${price}/${billing}). Please provide more details.`;
    window.open(`https://wa.me/917701931693?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section id="pricing" className="relative py-12 sm:py-16 lg:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 aurora-bg opacity-40" />
      
      <div className="relative z-10 container mx-auto px-3 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-6 gradient-text-animated">
              Simple, Transparent Pricing
            </h2>
            <p className="text-[10px] sm:text-sm md:text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-5 sm:mb-10 leading-relaxed px-2 sm:px-0">
              No hidden fees. Scale as you grow with our flexible plans.
            </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-2 sm:gap-4 p-1 sm:p-2 rounded-full glass-heavy">
            <span className={`text-[10px] sm:text-sm font-medium transition-colors ${!isYearly ? 'text-primary' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-[10px] sm:text-sm font-medium transition-colors ${isYearly ? 'text-primary' : 'text-muted-foreground'}`}>
              Yearly
              <span className="ml-1 sm:ml-2 text-[8px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full bg-primary/20 text-primary">
                Save 17%
              </span>
            </span>
          </div>
        </motion.div>
        
          {/* Pricing Cards with Stagger Animation */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-8 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15, delayChildren: 0.1 },
              },
            }}
          >
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                variants={{
                  hidden: { 
                    opacity: 0, 
                    y: 60, 
                    scale: 0.9,
                    rotateX: 10,
                  },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    rotateX: 0,
                    transition: {
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                    },
                  },
                }}
                className={`relative group ${plan.popular ? 'sm:-mt-4 sm:mb-4' : ''}`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <motion.div 
                    className="absolute -top-2 sm:-top-4 left-1/2 -translate-x-1/2 z-20"
                    initial={{ opacity: 0, y: -20, scale: 0.8 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  >
                    <div className="px-2.5 sm:px-4 py-0.5 sm:py-1 rounded-full bg-gradient-primary text-primary-foreground text-[9px] sm:text-sm font-semibold shadow-glow">
                      Best Value
                    </div>
                  </motion.div>
                )}
                
                <div className={`
                  relative h-full p-3 sm:p-5 md:p-8 rounded-lg sm:rounded-2xl frosted-card overflow-hidden
                  ${plan.popular ? 'border-primary/30 shadow-beam' : ''}
                `}>
                  {/* Glow effect for popular */}
                  {plan.popular && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
                  )}
                  
                  <div className="relative z-10">
                    {/* Plan header */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                      <div className={`
                        w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-lg flex items-center justify-center
                        ${plan.popular ? 'bg-primary/20' : 'bg-muted'}
                      `}>
                        <plan.icon className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-foreground">{plan.name}</h3>
                    </div>
                    
                    <p className="text-muted-foreground text-[9px] sm:text-sm mb-3 sm:mb-6">{plan.description}</p>
                    
                    {/* Price */}
                    <div className="mb-3 sm:mb-6">
                      <div className="flex items-baseline gap-0.5 sm:gap-1">
                        <span className="text-xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                          $<CountUp end={isYearly ? plan.yearlyPrice : plan.monthlyPrice} />
                        </span>
                        <span className="text-muted-foreground text-[9px] sm:text-sm">/{isYearly ? 'year' : 'month'}</span>
                      </div>
                    </div>
                    
                    {/* Features with staggered reveal */}
                    <ul className="space-y-1.5 sm:space-y-3 mb-4 sm:mb-8">
                      {plan.features.map((feature, i) => (
                        <motion.li 
                          key={i} 
                          className="flex items-center gap-1.5 sm:gap-3 text-[9px] sm:text-sm"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
                        >
                          <Check className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className="text-foreground/80">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    
                    {/* CTA */}
                    <Button
                      onClick={() => handleOrder(plan)}
                      className={`w-full py-4 sm:py-6 text-[10px] sm:text-sm font-semibold transition-all duration-300 group/btn ${
                        plan.popular
                          ? 'bg-gradient-primary text-primary-foreground hover:shadow-glow'
                          : 'bg-secondary hover:bg-secondary/80 text-foreground'
                      }`}
                    >
                      <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Get Started
                      <span className="ml-1.5 sm:ml-2 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all duration-300">→</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        
          {/* Stats with Pop Animation */}
          <PopGrid 
            className="mt-8 sm:mt-12 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 md:gap-6"
            staggerDelay={0.1}
          >
              {[
                { value: 10, suffix: "Gbps", label: "Network Speed" },
              { value: 50, suffix: "+", label: "Global Locations" },
              { value: 99.9, suffix: "%", label: "Uptime SLA" },
              { value: 24, suffix: "/7", label: "Expert Support" },
            ].map((stat, index) => (
              <div key={index} className="text-center p-3 sm:p-5 md:p-6 rounded-lg sm:rounded-xl glass-heavy group hover:border-primary/30 transition-all duration-300">
                <p className="text-lg sm:text-2xl md:text-4xl font-bold gradient-text-animated group-hover:scale-110 transition-transform duration-300">
                  <CountUp end={stat.value} />{stat.suffix}
                </p>
                <p className="text-muted-foreground text-[8px] sm:text-xs md:text-sm mt-0.5 sm:mt-1">{stat.label}</p>
              </div>
            ))}
          </PopGrid>
      </div>
    </section>
  );
};

export default Pricing;