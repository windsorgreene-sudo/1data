import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Server, MapPin } from 'lucide-react';
import worldMap from '@/assets/lovable-vps-map.jpg';
import { motion } from 'framer-motion';

interface VPSLocation {
  name: string;
  region: string;
  coordinates: [number, number]; // [longitude, latitude]
}

// Convert lat/lng to pixel position for a flat 2:1 equirectangular map
const latLngToPixel = (lat: number, lng: number) => {
  // Equirectangular projection matches standard 2:1 world maps
  const x = ((lng + 180) / 360) * 100; // 0% at -180°, 100% at +180°
  const y = ((90 - lat) / 180) * 100;  // 0% at +90° (top), 100% at -90° (bottom)
  return { x, y };
};

// Animated connection line component
interface ConnectionLineProps {
  from: VPSLocation;
  to: VPSLocation;
  delay: number;
}

const ConnectionLine = ({ from, to, delay }: ConnectionLineProps) => {
  const fromPos = latLngToPixel(from.coordinates[1], from.coordinates[0]);
  const toPos = latLngToPixel(to.coordinates[1], to.coordinates[0]);
  
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style={{ zIndex: 5 }}>
      {/* Base line */}
      <line
        x1={`${fromPos.x}%`}
        y1={`${fromPos.y}%`}
        x2={`${toPos.x}%`}
        y2={`${toPos.y}%`}
        stroke="hsl(var(--primary))"
        strokeWidth="1"
        strokeOpacity="0.2"
      />
      
      {/* Animated gradient line */}
      <motion.line
        x1={`${fromPos.x}%`}
        y1={`${fromPos.y}%`}
        x2={`${toPos.x}%`}
        y2={`${toPos.y}%`}
        stroke="url(#lineGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: [0, 1, 1, 0],
          opacity: [0, 1, 1, 0]
        }}
        transition={{
          duration: 3,
          delay: delay,
          repeat: Infinity,
          repeatDelay: 1,
          ease: "easeInOut"
        }}
      />
      
      {/* Data packet dot */}
      <motion.circle
        r="3"
        fill="hsl(var(--primary))"
        filter="url(#glow)"
        initial={{ opacity: 0 }}
        animate={{
          cx: [`${fromPos.x}%`, `${toPos.x}%`],
          cy: [`${fromPos.y}%`, `${toPos.y}%`],
          opacity: [0, 1, 1, 0]
        }}
        transition={{
          duration: 2.5,
          delay: delay + 0.3,
          repeat: Infinity,
          repeatDelay: 1.5,
          ease: "easeInOut"
        }}
      />
      
      {/* Definitions for gradient and glow */}
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
};

// Simple marker component
interface MarkerProps {
  location: VPSLocation;
  isSelected: boolean;
  onSelect: (name: string) => void;
}

const VPSMarker = ({ location, isSelected, onSelect }: MarkerProps) => {
  const [hovered, setHovered] = useState(false);
  const position = latLngToPixel(location.coordinates[1], location.coordinates[0]);

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-10 group"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(location.name);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* VPS Marker */}
      <div className="relative">
        {/* Pulse ring */}
        {(hovered || isSelected) && (
          <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" style={{ width: '24px', height: '24px', margin: '-8px' }} />
        )}
        
        {/* Main marker */}
        <div 
          className={`rounded-full transition-all duration-300 ${isSelected || hovered ? 'w-3.5 h-3.5 shadow-glow' : 'w-2.5 h-2.5'}`}
          style={{ 
            backgroundColor: 'hsl(var(--primary))',
            boxShadow: isSelected || hovered ? 'var(--glow-primary)' : '0 0 8px hsl(var(--primary) / 0.5)',
          }}
        />
      </div>
      
      {/* Tooltip */}
      {(hovered || isSelected) && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-card/95 backdrop-blur-xl border border-primary/30 rounded-lg whitespace-nowrap z-50 shadow-elegant animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm font-semibold text-foreground">{location.name}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{location.region}</div>
        </div>
      )}
    </div>
  );
};

// Generate connections between nearby datacenters
const generateConnections = (locations: VPSLocation[]): [VPSLocation, VPSLocation][] => {
  const connections: [VPSLocation, VPSLocation][] = [];
  
  // Define regional hub connections for a cleaner network visualization
  const hubConnections: [string, string][] = [
    // North America network
    ['New York', 'Toronto'],
    ['New York', 'Los Angeles'],
    
    // Europe network  
    ['London', 'Frankfurt'],
    ['Frankfurt', 'Amsterdam'],
    ['Amsterdam', 'Paris'],
    
    // Transatlantic
    ['New York', 'London'],
    
    // Asia Pacific network
    ['Singapore', 'Tokyo'],
    ['Singapore', 'Mumbai'],
    ['Singapore', 'Sydney'],
    
    // Europe to Asia
    ['Frankfurt', 'Dubai'],
    ['Dubai', 'Mumbai'],
    
    // South America connection
    ['New York', 'São Paulo'],
    
    // Africa connection
    ['Dubai', 'Johannesburg'],
  ];
  
  hubConnections.forEach(([fromName, toName]) => {
    const from = locations.find(l => l.name === fromName);
    const to = locations.find(l => l.name === toName);
    if (from && to) {
      connections.push([from, to]);
    }
  });
  
  return connections;
};

const DatacenterLocations = () => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const handleSelectLocation = (name: string) => {
    setSelectedLocation(selectedLocation === name ? null : name);
  };

  // VPS Datacenter Locations for Lovable.dev
  const vpsLocations: VPSLocation[] = [
    // North America
    { name: 'New York', region: 'United States', coordinates: [-74.0060, 40.7128] },
    { name: 'Los Angeles', region: 'United States', coordinates: [-118.2437, 34.0522] },
    { name: 'Toronto', region: 'Canada', coordinates: [-79.3832, 43.6532] },
    
    // Europe
    { name: 'London', region: 'United Kingdom', coordinates: [-0.1276, 51.5074] },
    { name: 'Frankfurt', region: 'Germany', coordinates: [8.6821, 50.1109] },
    { name: 'Amsterdam', region: 'Netherlands', coordinates: [4.9041, 52.3676] },
    { name: 'Paris', region: 'France', coordinates: [2.3522, 48.8566] },
    
    // Asia Pacific
    { name: 'Mumbai', region: 'India', coordinates: [72.8777, 19.0760] },
    { name: 'Singapore', region: 'Singapore', coordinates: [103.8198, 1.3521] },
    { name: 'Tokyo', region: 'Japan', coordinates: [139.6917, 35.6762] },
    { name: 'Sydney', region: 'Australia', coordinates: [151.2093, -33.8688] },
    
    // South America
    { name: 'São Paulo', region: 'Brazil', coordinates: [-46.6333, -23.5505] },
    
    // Africa
    { name: 'Johannesburg', region: 'South Africa', coordinates: [28.0473, -26.2041] },
    
    // Middle East
    { name: 'Dubai', region: 'United Arab Emirates', coordinates: [55.2708, 25.2048] },
  ];

  const connections = generateConnections(vpsLocations);

  return (
    <section id="locations" className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[image:var(--gradient-surface)] opacity-50"></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-4xl lg:text-5xl font-bold mb-3 bg-[image:var(--text-gradient)] bg-clip-text text-transparent">
            RDP VPS Datacenters
          </h2>
          <p className="text-lg text-muted-foreground">
            {vpsLocations.length} global locations for your RDP & VPS needs
          </p>
        </div>

        <div>
          <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-premium">
            <CardContent className="p-0">
              <div 
                className="relative w-full"
                style={{ aspectRatio: '16/9' }}
                onClick={() => setSelectedLocation(null)}
              >
                <img 
                  src={worldMap} 
                  alt="RDP VPS World Map"
                  className="w-full h-full object-contain opacity-85"
                  draggable={false}
                />
                
                {/* Animated Connection Lines */}
                {connections.map((connection, index) => (
                  <ConnectionLine
                    key={`${connection[0].name}-${connection[1].name}`}
                    from={connection[0]}
                    to={connection[1]}
                    delay={index * 0.4}
                  />
                ))}
                
                {/* VPS Markers */}
                {vpsLocations.map((location, index) => (
                  <VPSMarker
                    key={index}
                    location={location}
                    isSelected={selectedLocation === location.name}
                    onSelect={handleSelectLocation}
                  />
                ))}
                
                {/* Location count */}
                <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-xl border border-primary/20 rounded-xl px-4 py-2 shadow-elegant">
                  <div className="text-2xl font-bold text-primary">{vpsLocations.length}</div>
                  <div className="text-xs text-muted-foreground">Locations</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Legend */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center text-sm text-muted-foreground"
        >
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Live data connections between global datacenters
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default DatacenterLocations;
