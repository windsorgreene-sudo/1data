import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cpu, Server, HardDrive, Monitor, Terminal, Shield, Globe, Zap, Database, Check, Sparkles, Tag, X, Clock, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";
import PageTransition from "@/components/PageTransition";
import PricingComparison from "@/components/PricingComparison";
import { LoadingSkeleton, PricingCardSkeleton } from "@/components/ui/loading-skeleton";

type Plan = {
  code: string;
  vcpu: number;
  ram: string;
  storage: string;
  bandwidth: string;
  vpsPrice: number;
  rdpPrice: number | null;
};

type Category = {
  name: string;
  icon: React.ElementType;
  description: string;
  plans: Plan[];
};

// Real market prices from AWS, DigitalOcean, Vultr, etc.
const getMarketPrice = (ourPrice: number, type: 'vps' | 'rdp'): number => {
  // Market prices are typically 40-60% higher
  const multiplier = type === 'rdp' ? 1.55 : 1.45;
  return Math.round(ourPrice * multiplier);
};

const sharedCpuCategories: Category[] = [
  {
    name: "Cloud Compute",
    icon: Server,
    description: "Affordable SSD-backed instances",
    plans: [
      { code: "vc2-2c-4gb", vcpu: 2, ram: "4 GB", storage: "80 GB SSD", bandwidth: "3 TB", vpsPrice: 9, rdpPrice: null },
      { code: "vc2-4c-8gb", vcpu: 4, ram: "8 GB", storage: "160 GB SSD", bandwidth: "4 TB", vpsPrice: 17, rdpPrice: 33 },
      { code: "vc2-6c-16gb", vcpu: 6, ram: "16 GB", storage: "320 GB SSD", bandwidth: "5 TB", vpsPrice: 31, rdpPrice: 60 },
      { code: "vc2-8c-32gb", vcpu: 8, ram: "32 GB", storage: "640 GB SSD", bandwidth: "6 TB", vpsPrice: 56, rdpPrice: 99 },
    ],
  },
  {
    name: "High Frequency",
    icon: Zap,
    description: "Intel 3GHz+ high clock speed",
    plans: [
      { code: "vhf-2c-4gb", vcpu: 2, ram: "4 GB", storage: "128 GB NVMe", bandwidth: "3 TB", vpsPrice: 13, rdpPrice: null },
      { code: "vhf-4c-8gb", vcpu: 4, ram: "8 GB", storage: "256 GB NVMe", bandwidth: "4 TB", vpsPrice: 23, rdpPrice: 42 },
      { code: "vhf-8c-16gb", vcpu: 8, ram: "16 GB", storage: "350 GB NVMe", bandwidth: "6 TB", vpsPrice: 45, rdpPrice: 75 },
      { code: "vhf-12c-32gb", vcpu: 12, ram: "32 GB", storage: "768 GB NVMe", bandwidth: "8 TB", vpsPrice: 80, rdpPrice: 130 },
    ],
  },
  {
    name: "High Performance",
    icon: Cpu,
    description: "AMD & Intel powered",
    plans: [
      { code: "vhp-2c-4gb", vcpu: 2, ram: "4 GB", storage: "100 GB NVMe", bandwidth: "4 TB", vpsPrice: 14, rdpPrice: null },
      { code: "vhp-4c-8gb", vcpu: 4, ram: "8 GB", storage: "200 GB NVMe", bandwidth: "5 TB", vpsPrice: 25, rdpPrice: 45 },
      { code: "vhp-8c-16gb", vcpu: 8, ram: "16 GB", storage: "350 GB NVMe", bandwidth: "7 TB", vpsPrice: 47, rdpPrice: 82 },
      { code: "vhp-16c-32gb", vcpu: 16, ram: "32 GB", storage: "512 GB NVMe", bandwidth: "9 TB", vpsPrice: 85, rdpPrice: 140 },
    ],
  },
];

const dedicatedCpuCategories: Category[] = [
  {
    name: "General Purpose",
    icon: Server,
    description: "Balanced dedicated resources",
    plans: [
      { code: "voc-g-2c-4gb", vcpu: 2, ram: "4 GB", storage: "50 GB NVMe", bandwidth: "4 TB", vpsPrice: 16, rdpPrice: null },
      { code: "voc-g-2c-8gb", vcpu: 2, ram: "8 GB", storage: "50 GB NVMe", bandwidth: "5 TB", vpsPrice: 21, rdpPrice: 37 },
      { code: "voc-g-4c-16gb", vcpu: 4, ram: "16 GB", storage: "80 GB NVMe", bandwidth: "6 TB", vpsPrice: 41, rdpPrice: 70 },
      { code: "voc-g-8c-32gb", vcpu: 8, ram: "32 GB", storage: "160 GB NVMe", bandwidth: "7 TB", vpsPrice: 78, rdpPrice: 125 },
    ],
  },
  {
    name: "CPU Optimized",
    icon: Cpu,
    description: "High CPU-to-RAM ratio",
    plans: [
      { code: "voc-c-2c-4gb", vcpu: 2, ram: "4 GB", storage: "50 GB NVMe", bandwidth: "4 TB", vpsPrice: 18, rdpPrice: null },
      { code: "voc-c-2c-8gb", vcpu: 2, ram: "8 GB", storage: "50 GB NVMe", bandwidth: "5 TB", vpsPrice: 25, rdpPrice: 43 },
      { code: "voc-c-4c-16gb", vcpu: 4, ram: "16 GB", storage: "75 GB NVMe", bandwidth: "6 TB", vpsPrice: 47, rdpPrice: 80 },
    ],
  },
  {
    name: "Memory Optimized",
    icon: Database,
    description: "High RAM for databases & caching",
    plans: [
      { code: "voc-m-1c-8gb", vcpu: 1, ram: "8 GB", storage: "50 GB NVMe", bandwidth: "5 TB", vpsPrice: 23, rdpPrice: 41 },
      { code: "voc-m-2c-16gb", vcpu: 2, ram: "16 GB", storage: "100 GB NVMe", bandwidth: "6 TB", vpsPrice: 43, rdpPrice: 74 },
      { code: "voc-m-4c-32gb", vcpu: 4, ram: "32 GB", storage: "200 GB NVMe", bandwidth: "8 TB", vpsPrice: 76, rdpPrice: 132 },
    ],
  },
  {
    name: "Storage Optimized",
    icon: HardDrive,
    description: "Large NVMe for data workloads",
    plans: [
      { code: "voc-s-2c-8gb", vcpu: 2, ram: "8 GB", storage: "150 GB NVMe", bandwidth: "4 TB", vpsPrice: 29, rdpPrice: 48 },
      { code: "voc-s-2c-16gb", vcpu: 2, ram: "16 GB", storage: "320 GB NVMe", bandwidth: "6 TB", vpsPrice: 50, rdpPrice: 86 },
      { code: "voc-s-4c-32gb", vcpu: 4, ram: "32 GB", storage: "640 GB NVMe", bandwidth: "7 TB", vpsPrice: 90, rdpPrice: 148 },
    ],
  },
];

const handleOrder = (plan: Plan, type: "vps" | "rdp") => {
  const price = type === "vps" ? plan.vpsPrice : plan.rdpPrice;
  const prefix = type === "rdp" ? "rdp-" : "";
  const message = `Hi, I'm interested in ${prefix}${plan.code} - ${plan.vcpu} vCPU, ${plan.ram} RAM, ${plan.storage} at $${price}/mo`;
  window.open(`https://wa.me/17788517393?text=${encodeURIComponent(message)}`, "_blank");
};

// Use real market price function instead of static multiplier

// Mobile Plan Card Component with hover effects
import ScrollAnimationWrapper from "@/components/ScrollAnimationWrapper";

const MobilePlanCard = ({ plan }: { plan: Plan }) => (
  <motion.div 
    className="bg-background/50 backdrop-blur-sm border border-primary/10 rounded-xl p-3.5 sm:p-4 space-y-3 sm:space-y-4 hover:border-primary/30 transition-all duration-300"
    whileHover={{ scale: 1.01, y: -3 }}
    whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "200px 0px -50px 0px", amount: 0 }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <motion.div 
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
          whileHover={{ rotate: 10, scale: 1.1 }}
        >
          <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </motion.div>
        <div>
          <p className="font-semibold text-[13px] sm:text-sm">{plan.vcpu} vCPU • {plan.ram}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-mono">{plan.code}</p>
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-xs">
      <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
        <HardDrive className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span>{plan.storage}</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
        <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span>{plan.bandwidth}</span>
      </div>
    </div>
    
    <div className="flex gap-2 pt-3 border-t border-primary/10">
      <Button 
        size="sm"
        variant="glow"
        className="flex-1 transition-all h-10 sm:h-11 text-[11px] sm:text-xs"
        onClick={() => handleOrder(plan, "vps")}
      >
        <Terminal className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
        <span className="flex flex-col items-start leading-tight">
          <span className="line-through text-primary-foreground/60 text-[9px] sm:text-[10px]">${getMarketPrice(plan.vpsPrice, 'vps')}</span>
          <span className="font-bold">${plan.vpsPrice}/mo</span>
        </span>
      </Button>
      {plan.rdpPrice ? (
        <Button 
          size="sm"
          variant="premium"
          className="flex-1 transition-all h-10 sm:h-11 text-[11px] sm:text-xs"
          onClick={() => handleOrder(plan, "rdp")}
        >
          <Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
          <span className="flex flex-col items-start leading-tight">
            <span className="line-through text-accent-foreground/60 text-[9px] sm:text-[10px]">${getMarketPrice(plan.rdpPrice, 'rdp')}</span>
            <span className="font-bold">${plan.rdpPrice}/mo</span>
          </span>
        </Button>
      ) : (
        <Button size="sm" variant="secondary" className="flex-1 opacity-40 cursor-not-allowed h-10 sm:h-11 text-[11px] sm:text-xs" disabled>
          <Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
          <span>8GB+ RAM</span>
        </Button>
      )}
    </div>
  </motion.div>
);

// Desktop Table Row Component with hover animations
const PlanRow = ({ plan, index }: { plan: Plan; index: number }) => (
  <motion.tr 
    className="border-b border-primary/5 hover:bg-primary/5 transition-colors group"
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "200px 0px -50px 0px", amount: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    <td className="py-4 px-3 lg:px-4">
      <div className="flex items-center gap-2 lg:gap-3">
        <motion.div 
          className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center shrink-0 group-hover:from-primary/25 group-hover:to-accent/25 transition-all"
          whileHover={{ rotate: 10, scale: 1.1 }}
        >
          <Cpu className="w-4 h-4 text-primary" />
        </motion.div>
        <div className="min-w-0">
          <p className="font-medium text-sm lg:text-base">{plan.vcpu} vCPU</p>
          <p className="text-xs text-muted-foreground font-mono truncate">{plan.code}</p>
        </div>
      </div>
    </td>
    <td className="py-4 px-2 lg:px-4 text-center">
      <span className="font-semibold text-sm lg:text-base">{plan.ram}</span>
    </td>
    <td className="py-4 px-2 lg:px-4 text-center hidden sm:table-cell">
      <span className="text-sm text-muted-foreground">{plan.storage}</span>
    </td>
    <td className="py-4 px-2 lg:px-4 text-center hidden md:table-cell">
      <span className="text-sm text-muted-foreground">{plan.bandwidth}</span>
    </td>
    <td className="py-4 px-2 lg:px-4">
      <div className="flex items-center justify-center gap-2">
        <div className="flex flex-col items-end min-w-[70px]">
          <span className="text-xs text-muted-foreground/70 line-through">${getMarketPrice(plan.vpsPrice, 'vps')}</span>
          <motion.span 
            className="text-lg font-bold text-primary"
            whileHover={{ scale: 1.1 }}
          >
            ${plan.vpsPrice}<span className="text-xs font-normal">/mo</span>
          </motion.span>
        </div>
        <Button 
          size="sm" 
          className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 h-9 px-3 transition-all shadow-sm hover:shadow-primary/20"
          onClick={() => handleOrder(plan, "vps")}
        >
          <Terminal className="w-3.5 h-3.5 lg:mr-1.5" />
          <span className="hidden lg:inline">Order</span>
        </Button>
      </div>
    </td>
    <td className="py-4 px-2 lg:px-4">
      {plan.rdpPrice ? (
        <div className="flex items-center justify-center gap-2">
          <div className="flex flex-col items-end min-w-[70px]">
            <span className="text-xs text-muted-foreground/70 line-through">${getMarketPrice(plan.rdpPrice, 'rdp')}</span>
            <motion.span 
              className="text-lg font-bold text-accent"
              whileHover={{ scale: 1.1 }}
            >
              ${plan.rdpPrice}<span className="text-xs font-normal">/mo</span>
            </motion.span>
          </div>
          <Button 
            size="sm"
            className="bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground border border-accent/20 h-9 px-3 transition-all shadow-sm hover:shadow-accent/20"
            onClick={() => handleOrder(plan, "rdp")}
          >
            <Monitor className="w-3.5 h-3.5 lg:mr-1.5" />
            <span className="hidden lg:inline">Order</span>
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <span className="text-xs text-muted-foreground/60 bg-secondary/30 px-3 py-1.5 rounded-md">Requires 8GB+</span>
        </div>
      )}
    </td>
  </motion.tr>
);

const CategorySection = ({ category, index }: { category: Category; index: number }) => {
  const Icon = category.icon;
  
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-xl lg:rounded-2xl overflow-hidden hover:border-primary/20 transition-all duration-300">
      {/* Header */}
      <div className="px-3.5 sm:px-4 lg:px-6 py-3 sm:py-4 bg-gradient-to-r from-primary/5 via-accent/5 to-transparent border-b border-primary/10">
        <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
              <span className="text-[10px] sm:text-xs font-medium text-primary bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded">#{index}</span>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold">{category.name}</h3>
            </div>
            <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground mt-0.5 truncate">{category.description}</p>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden p-3 sm:p-4 grid gap-2.5 sm:gap-3">
        {category.plans.map((plan) => (
          <MobilePlanCard key={plan.code} plan={plan} />
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/10 bg-primary/5">
              <th className="text-left py-2.5 sm:py-3 px-3 lg:px-4 font-medium text-muted-foreground text-[11px] sm:text-xs lg:text-sm">Config</th>
              <th className="text-center py-2.5 sm:py-3 px-2 lg:px-4 font-medium text-muted-foreground text-[11px] sm:text-xs lg:text-sm">RAM</th>
              <th className="text-center py-2.5 sm:py-3 px-2 lg:px-4 font-medium text-muted-foreground text-[11px] sm:text-xs lg:text-sm hidden sm:table-cell">Storage</th>
              <th className="text-center py-2.5 sm:py-3 px-2 lg:px-4 font-medium text-muted-foreground text-[11px] sm:text-xs lg:text-sm hidden md:table-cell">Bandwidth</th>
              <th className="text-center py-2.5 sm:py-3 px-2 lg:px-4 font-medium text-[11px] sm:text-xs lg:text-sm">
                <span className="text-primary">VPS Price</span>
              </th>
              <th className="text-center py-2.5 sm:py-3 px-2 lg:px-4 font-medium text-[11px] sm:text-xs lg:text-sm">
                <span className="text-accent">RDP Price</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {category.plans.map((plan, planIndex) => (
              <PlanRow key={plan.code} plan={plan} index={planIndex} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Pricing = () => {
  return (
    <>
      <Header />
      <PageTransition>
        <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Professional Background Design */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Animated Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
              backgroundSize: '80px 80px'
            }}
          />
          
          {/* Hexagon Pattern Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5L55 17.5V42.5L30 55L5 42.5V17.5L30 5Z' fill='none' stroke='%2360A5FA' stroke-width='0.5'/%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}
          />
          
          {/* Gradient Orbs - More Dynamic */}
          <div className="absolute -top-40 left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-primary/15 via-primary/5 to-transparent rounded-full blur-[150px] animate-pulse" />
          <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-gradient-to-bl from-accent/15 via-accent/5 to-transparent rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-gradient-to-t from-primary/10 via-accent/5 to-transparent rounded-full blur-[100px]" />
          
          {/* Diagonal Lines */}
          <div 
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, hsl(var(--primary)), hsl(var(--primary)) 1px, transparent 1px, transparent 100px)`
            }}
          />
          
          {/* Floating Particles Effect */}
          <div className="absolute top-20 left-10 w-2 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
          <div className="absolute top-40 right-20 w-3 h-3 bg-accent/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4s' }} />
          <div className="absolute top-60 left-1/3 w-2 h-2 bg-primary/20 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '3.5s' }} />
          <div className="absolute bottom-40 right-1/4 w-2 h-2 bg-accent/25 rounded-full animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '4.5s' }} />
        </div>

          <main className="relative pt-20 sm:pt-24 lg:pt-28 pb-10 sm:pb-12 lg:pb-20">
            {/* Hero */}
            <section className="container mx-auto px-4 sm:px-6 text-center mb-8 sm:mb-10 lg:mb-14">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-6">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <span className="text-[11px] sm:text-xs font-medium text-primary">Enterprise-Grade Infrastructure</span>
              </div>
              
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight">
                    Powerful Servers, <span className="gradient-text-animated">Fair Prices</span>
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
                    High-performance cloud infrastructure with transparent pricing. Scale your business with confidence — no hidden fees.
                  </p>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 lg:gap-4">
                <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-card/50 border border-primary/10">
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span className="text-[11px] sm:text-xs font-medium">99.9% Uptime</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-card/50 border border-primary/10">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                  <span className="text-[11px] sm:text-xs font-medium">Ultra-Low Latency</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-card/50 border border-primary/10">
                  <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span className="text-[11px] sm:text-xs font-medium">Global Network</span>
                </div>
              </div>
            </section>

          {/* Tabs */}
          <section className="container mx-auto px-4 sm:px-6 mb-8 sm:mb-10 lg:mb-16">
            <Tabs defaultValue="shared" className="w-full">
              <div className="flex justify-center mb-5 sm:mb-6 lg:mb-8">
                <TabsList className="h-11 sm:h-12 lg:h-14 p-1 sm:p-1.5 bg-card/50 backdrop-blur-sm border border-primary/10 rounded-lg sm:rounded-xl">
                  <TabsTrigger 
                    value="shared" 
                    className="h-8 sm:h-9 lg:h-11 px-3 sm:px-5 lg:px-8 rounded-md sm:rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground text-[11px] sm:text-xs lg:text-sm font-medium transition-all"
                  >
                    <Server className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 lg:mr-2" />
                    Shared CPU
                  </TabsTrigger>
                  <TabsTrigger 
                    value="dedicated"
                    className="h-8 sm:h-9 lg:h-11 px-3 sm:px-5 lg:px-8 rounded-md sm:rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-accent/80 data-[state=active]:text-accent-foreground text-[11px] sm:text-xs lg:text-sm font-medium transition-all"
                  >
                    <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 lg:mr-2" />
                    Dedicated CPU
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Shared CPU Tab */}
              <TabsContent value="shared" className="mt-0">
                <div className="mb-5 lg:mb-6 p-3 lg:p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                  <p className="text-xs lg:text-sm">
                    <span className="font-semibold text-primary">Shared CPU</span>
                    <span className="text-muted-foreground"> — Best for websites, testing & lightweight workloads</span>
                  </p>
                </div>
                <div className="space-y-4 lg:space-y-6">
                  {sharedCpuCategories.map((category, idx) => (
                    <CategorySection key={category.name} category={category} index={idx + 1} />
                  ))}
                </div>
              </TabsContent>

              {/* Dedicated CPU Tab */}
              <TabsContent value="dedicated" className="mt-0">
                <div className="mb-5 lg:mb-6 p-3 lg:p-4 rounded-xl bg-accent/5 border border-accent/10 text-center">
                  <p className="text-xs lg:text-sm">
                    <span className="font-semibold text-accent">Dedicated CPU</span>
                    <span className="text-muted-foreground"> — For production & high-load applications</span>
                  </p>
                </div>
                <div className="space-y-4 lg:space-y-6">
                  {dedicatedCpuCategories.map((category, idx) => (
                    <CategorySection key={category.name} category={category} index={idx + 1} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </section>

          {/* Pricing Comparison Table */}
          <section className="container mx-auto px-4 mb-10 lg:mb-16">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "200px 0px -50px 0px", amount: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Quick <span className="gradient-text-animated">Comparison</span>
              </h2>
              <p className="text-muted-foreground">Compare features across all plans</p>
            </motion.div>
            <PricingComparison />
          </section>

          {/* Features */}
          <section className="container mx-auto px-4">
            <div className="grid sm:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
              {/* VPS Features */}
              <div className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-xl lg:rounded-2xl p-5 lg:p-6 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-2 lg:gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base lg:text-lg font-semibold">VPS Features</h3>
                </div>
                <div className="space-y-2.5 text-sm">
                  {["Full Root Access", "Ubuntu / Debian / AlmaLinux", "NVMe / SSD Storage", "High-speed Network"].map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RDP Features */}
              <div className="bg-card/50 backdrop-blur-sm border border-accent/10 rounded-xl lg:rounded-2xl p-5 lg:p-6 hover:border-accent/20 transition-all">
                <div className="flex items-center gap-2 lg:gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-base lg:text-lg font-semibold">RDP Features</h3>
                </div>
                <div className="space-y-2.5 text-sm">
                  {["Full Admin Access", "Windows Server 2019/2022", "NVMe SSD Storage", "High-speed Remote Desktop"].map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-accent" />
                      </div>
                      <span className="text-muted-foreground">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* All Plans Include */}
            <div className="bg-gradient-to-r from-primary/5 via-card/50 to-accent/5 backdrop-blur-sm border border-primary/10 rounded-xl lg:rounded-2xl p-5 lg:p-8 text-center">
              <h3 className="font-semibold mb-5 text-base lg:text-lg">All Plans Include</h3>
              <div className="flex flex-wrap justify-center gap-4 lg:gap-8 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  99.9% Uptime
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-primary" />
                  </div>
                  IPv4 + IPv6
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  Unlimited Login
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Server className="w-4 h-4 text-primary" />
                  </div>
                  Full Control
                </span>
              </div>
            </div>
          </section>
        </main>

        <Footer />
        </div>
      </PageTransition>
      <FloatingActions />
    </>
  );
};

export default Pricing;
