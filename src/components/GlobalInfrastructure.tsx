import { motion } from "framer-motion";
import worldMap from "@/assets/world-map-professional.png";
import { TextReveal, ParagraphReveal } from "./TextReveal";

const serverLocations = [
  { name: "New York", region: "USA East", x: 24, y: 36 },
  { name: "Los Angeles", region: "USA West", x: 12, y: 40 },
  { name: "London", region: "Europe", x: 47, y: 30 },
  { name: "Frankfurt", region: "Europe", x: 51, y: 32 },
  { name: "Singapore", region: "Asia Pacific", x: 78, y: 58 },
  { name: "Tokyo", region: "Asia", x: 87, y: 38 },
  { name: "Sydney", region: "Oceania", x: 89, y: 78 },
  { name: "Mumbai", region: "India", x: 70, y: 48 },
  { name: "São Paulo", region: "South America", x: 30, y: 72 },
  { name: "Amsterdam", region: "Europe", x: 49, y: 28 },
];

// Connection pairs for animated beams
const connections = [
  [0, 2], // NY to London
  [2, 3], // London to Frankfurt
  [3, 9], // Frankfurt to Amsterdam
  [3, 7], // Frankfurt to Mumbai
  [7, 4], // Mumbai to Singapore
  [4, 5], // Singapore to Tokyo
  [4, 6], // Singapore to Sydney
  [1, 0], // LA to NY
  [8, 0], // Sao Paulo to NY
];

// Particle component for traveling along connection lines
const TravelingParticle = ({ 
  start, 
  end, 
  delay = 0,
  duration = 3
}: { 
  start: { x: number; y: number }; 
  end: { x: number; y: number }; 
  delay?: number;
  duration?: number;
}) => {
  return (
    <motion.circle
      r="3"
      fill="url(#particle-gradient)"
      filter="url(#glow)"
      initial={{ 
        cx: `${start.x}%`, 
        cy: `${start.y}%`,
        opacity: 0 
      }}
      animate={{ 
        cx: [`${start.x}%`, `${end.x}%`],
        cy: [`${start.y}%`, `${end.y}%`],
        opacity: [0, 1, 1, 0]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
        times: [0, 0.1, 0.9, 1]
      }}
    />
  );
};

const GlobalInfrastructure = () => {
  return (
    <section id="global-map" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 aurora-bg opacity-30" />
      
      <div className="relative z-10 container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "200px 0px -50px 0px", amount: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4 gradient-text-animated">
                Global Infrastructure
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Deploy your servers across 50+ locations worldwide for minimal latency
              </p>
            </motion.div>
          
          {/* Map Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "200px 0px -50px 0px", amount: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-6xl mx-auto"
        >
          {/* Map background with image */}
          <div className="relative aspect-[2/1] rounded-2xl frosted-card overflow-hidden">
            {/* Professional World Map Image */}
            <div className="absolute inset-0">
              <img 
                src={worldMap} 
                alt="World Map" 
                className="w-full h-full object-cover opacity-40"
              />
              {/* Gradient overlay for better visibility */}
              <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/40" />
            </div>
            
            {/* Animated grid overlay */}
              <motion.div 
                className="absolute inset-0 opacity-[0.08]"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.08 }}
                viewport={{ once: true, margin: "200px 0px -50px 0px", amount: 0 }}
                transition={{ duration: 1 }}
              style={{
                backgroundImage: `
                  linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                  linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}
            />
            
            {/* Connection lines and particles */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="particle-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Connection lines */}
              {connections.map(([startIdx, endIdx], i) => {
                const start = serverLocations[startIdx];
                const end = serverLocations[endIdx];
                return (
                  <g key={`connection-${i}`}>
                    {/* Static line */}
                    <motion.line
                      x1={`${start.x}%`}
                      y1={`${start.y}%`}
                      x2={`${end.x}%`}
                      y2={`${end.y}%`}
                      stroke="url(#beam-gradient)"
                      strokeWidth="1.5"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 0.6 }}
                        viewport={{ once: true, margin: "200px 0px -50px 0px", amount: 0 }}
                    />
                    
                    {/* Traveling particles */}
                    <TravelingParticle 
                      start={start} 
                      end={end} 
                      delay={i * 0.5} 
                      duration={2 + Math.random()}
                    />
                    <TravelingParticle 
                      start={end} 
                      end={start} 
                      delay={i * 0.5 + 1} 
                      duration={2.5 + Math.random()}
                    />
                  </g>
                );
              })}
            </svg>
            
            {/* Server location dots */}
            {serverLocations.map((location, index) => (
              <motion.div
                key={location.name}
                className="absolute group cursor-pointer"
                style={{ left: `${location.x}%`, top: `${location.y}%` }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "200px 0px -50px 0px", amount: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                {/* Outer pulse ring */}
                <motion.div
                  className="absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20"
                  animate={{ scale: [1, 2.5, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                />
                
                {/* Inner pulse ring */}
                <motion.div
                  className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30"
                  animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.15 }}
                />
                
                {/* Core dot with glow */}
                <motion.div 
                  className="relative w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary to-accent shadow-[0_0_15px_hsl(var(--primary)/0.6)]"
                  whileHover={{ scale: 1.5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                />
                
                {/* Enhanced Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-16 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 scale-90 group-hover:scale-100">
                  <motion.div 
                    className="px-4 py-3 rounded-xl glass-heavy text-center whitespace-nowrap border border-primary/20 shadow-lg"
                    initial={false}
                  >
                    <p className="text-sm font-bold text-foreground">{location.name}</p>
                    <p className="text-xs text-primary font-medium">{location.region}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] text-muted-foreground">Online</span>
                    </div>
                    {/* Arrow */}
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45 bg-card border-r border-b border-primary/20" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {["Americas", "Europe", "Asia Pacific"].map((region, index) => (
              <motion.div 
                key={region} 
                className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "200px 0px -50px 0px", amount: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <motion.div
                  className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-accent"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                />
                <span className="text-sm text-muted-foreground">{region}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GlobalInfrastructure;