import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles, Zap, Shield, Cpu, HardDrive, Globe, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Feature {
  name: string;
  icon: typeof Check;
  starter: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
  highlight?: boolean;
}

const features: Feature[] = [
  { name: "vCPU Cores", icon: Cpu, starter: "2", pro: "4", enterprise: "8", highlight: true },
  { name: "RAM", icon: Zap, starter: "4 GB", pro: "8 GB", enterprise: "32 GB", highlight: true },
  { name: "NVMe Storage", icon: HardDrive, starter: "80 GB", pro: "160 GB", enterprise: "640 GB", highlight: true },
  { name: "Bandwidth", icon: Globe, starter: "3 TB", pro: "4 TB", enterprise: "6 TB" },
  { name: "Global Network", icon: Globe, starter: true, pro: true, enterprise: true },
  { name: "Full Root Access", icon: Check, starter: true, pro: true, enterprise: true },
  { name: "99.9% Uptime SLA", icon: Check, starter: true, pro: true, enterprise: true },
  { name: "24/7 Support", icon: Headphones, starter: "Email", pro: "Priority", enterprise: "Dedicated" },
  { name: "Automated Backups", icon: Check, starter: false, pro: true, enterprise: true },
  { name: "Private Network", icon: Check, starter: false, pro: false, enterprise: true },
  { name: "Custom ISO", icon: Check, starter: false, pro: true, enterprise: true },
  { name: "Load Balancer", icon: Check, starter: false, pro: false, enterprise: true },
];

const plans = [
  { name: "Starter", price: 9, color: "primary", popular: false },
  { name: "Pro", price: 17, color: "accent", popular: true },
  { name: "Enterprise", price: 56, color: "primary", popular: false },
];

const PricingComparison = () => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  const handleOrder = (planName: string, price: number) => {
    const message = `Hi, I'm interested in the ${planName} plan at $${price}/mo. Please provide more details.`;
    window.open(`https://wa.me/17788517393?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-card/30 backdrop-blur-xl">
      {/* Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-primary/10">
        <div className="p-3 sm:p-4 md:p-6 flex items-center col-span-2 sm:col-span-1">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">Features</span>
        </div>
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            className={`p-3 sm:p-4 md:p-6 text-center relative ${plan.popular ? 'bg-primary/5' : ''}`}
            onMouseEnter={() => setHoveredPlan(plan.name)}
            onMouseLeave={() => setHoveredPlan(null)}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {plan.popular && (
              <motion.div
                className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"
                layoutId="popular"
              />
            )}
            {plan.popular && (
              <motion.span
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-0.5 text-[10px] sm:text-xs font-semibold bg-gradient-primary text-primary-foreground rounded-full flex items-center gap-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                Most Popular
              </motion.span>
            )}
            <h3 className="text-sm sm:text-base md:text-lg font-bold mb-1">{plan.name}</h3>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-text-gradient bg-clip-text text-transparent">
                ${plan.price}
              </span>
              <span className="text-muted-foreground text-[10px] sm:text-xs md:text-sm">/mo</span>
            </div>
            <Button
              size="sm"
              className={`mt-2 sm:mt-3 md:mt-4 w-full text-[10px] sm:text-xs md:text-sm h-7 sm:h-8 md:h-9 ${plan.popular ? 'bg-gradient-primary text-primary-foreground hover:shadow-glow' : 'bg-secondary hover:bg-secondary/80'}`}
              onClick={() => handleOrder(plan.name, plan.price)}
            >
              Get Started
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Features */}
      <div className="divide-y divide-primary/5 hidden sm:block">
        {features.map((feature, rowIndex) => (
          <motion.div
            key={feature.name}
            className={`grid grid-cols-4 transition-colors duration-200 ${
              hoveredRow === rowIndex ? 'bg-primary/5' : ''
            } ${feature.highlight ? 'bg-primary/[0.02]' : ''}`}
            onMouseEnter={() => setHoveredRow(rowIndex)}
            onMouseLeave={() => setHoveredRow(null)}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: rowIndex * 0.03 }}
          >
            <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <feature.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${feature.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[11px] sm:text-xs md:text-sm ${feature.highlight ? 'font-medium' : 'text-muted-foreground'}`}>
                {feature.name}
              </span>
            </div>
            {[feature.starter, feature.pro, feature.enterprise].map((value, colIndex) => (
              <motion.div
                key={colIndex}
                className={`p-3 sm:p-4 flex items-center justify-center ${
                  plans[colIndex].popular ? 'bg-primary/[0.02]' : ''
                }`}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {typeof value === 'boolean' ? (
                  value ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + colIndex * 0.05, type: "spring" }}
                    >
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                    </motion.div>
                  ) : (
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground/30" />
                  )
                ) : (
                  <span className={`text-[11px] sm:text-xs md:text-sm font-medium ${
                    feature.highlight ? 'text-primary' : ''
                  }`}>
                    {value}
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* Mobile Features - Simplified */}
      <div className="sm:hidden divide-y divide-primary/5">
        {features.slice(0, 6).map((feature, rowIndex) => (
          <div
            key={feature.name}
            className={`grid grid-cols-4 ${feature.highlight ? 'bg-primary/[0.02]' : ''}`}
          >
            <div className="p-2.5 flex items-center gap-2 col-span-1">
              <span className={`text-[10px] ${feature.highlight ? 'font-medium' : 'text-muted-foreground'}`}>
                {feature.name}
              </span>
            </div>
            {[feature.starter, feature.pro, feature.enterprise].map((value, colIndex) => (
              <div
                key={colIndex}
                className={`p-2.5 flex items-center justify-center ${
                  plans[colIndex].popular ? 'bg-primary/[0.02]' : ''
                }`}
              >
                {typeof value === 'boolean' ? (
                  value ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-muted-foreground/30" />
                  )
                ) : (
                  <span className={`text-[10px] font-medium ${feature.highlight ? 'text-primary' : ''}`}>
                    {value}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer CTAs */}
      <div className="hidden sm:grid grid-cols-4 border-t border-primary/10 bg-background/50">
        <div className="p-4 md:p-6" />
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            className={`p-4 md:p-6 text-center ${plan.popular ? 'bg-primary/5' : ''}`}
            whileHover={{ scale: 1.02 }}
          >
            <Button
              className={`w-full text-xs md:text-sm h-8 md:h-10 ${plan.popular ? 'bg-gradient-primary text-primary-foreground hover:shadow-glow' : 'bg-secondary hover:bg-secondary/80'}`}
              onClick={() => handleOrder(plan.name, plan.price)}
            >
              Choose {plan.name}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PricingComparison;
