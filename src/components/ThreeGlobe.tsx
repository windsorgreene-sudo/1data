import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Line, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { GlobeSkeleton } from '@/components/ui/loading-skeleton';
import { Globe2, Server, Zap, Shield } from 'lucide-react';

interface DatacenterLocation {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  is_primary_hub: boolean;
}

// Convert lat/lng to 3D position on sphere
const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  
  return new THREE.Vector3(x, y, z);
};

// Generate arc points between two positions
const generateArcPoints = (start: THREE.Vector3, end: THREE.Vector3, segments: number = 50): THREE.Vector3[] => {
  const points: THREE.Vector3[] = [];
  const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const distance = start.distanceTo(end);
  midPoint.normalize().multiplyScalar(start.length() + distance * 0.3);
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = new THREE.Vector3();
    
    // Quadratic bezier curve
    point.x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * midPoint.x + t * t * end.x;
    point.y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * midPoint.y + t * t * end.y;
    point.z = (1 - t) * (1 - t) * start.z + 2 * (1 - t) * t * midPoint.z + t * t * end.z;
    
    points.push(point);
  }
  
  return points;
};

// Animated data packet component
const DataPacket = ({ arcPoints, speed = 0.01, delay = 0 }: { arcPoints: THREE.Vector3[]; speed?: number; delay?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(delay);
  
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    progressRef.current += delta * speed * 60;
    if (progressRef.current > 1) progressRef.current = 0;
    
    const index = Math.floor(progressRef.current * (arcPoints.length - 1));
    const nextIndex = Math.min(index + 1, arcPoints.length - 1);
    const localT = (progressRef.current * (arcPoints.length - 1)) % 1;
    
    const currentPoint = arcPoints[index];
    const nextPoint = arcPoints[nextIndex];
    
    if (currentPoint && nextPoint) {
      meshRef.current.position.lerpVectors(currentPoint, nextPoint, localT);
    }
  });
  
  return (
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.012, 6, 6]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.8} />
      </mesh>
  );
};

// Connection beam with animation
const ConnectionBeam = ({ start, end, isPrimary = false }: { start: THREE.Vector3; end: THREE.Vector3; isPrimary?: boolean }) => {
  const arcPoints = useMemo(() => generateArcPoints(start, end), [start, end]);
  const [opacity, setOpacity] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setOpacity(isPrimary ? 0.6 : 0.3), Math.random() * 1000);
    return () => clearTimeout(timer);
  }, [isPrimary]);
  
  return (
    <group>
      <Line
        points={arcPoints}
        color={isPrimary ? "#00d4ff" : "#8b5cf6"}
        lineWidth={isPrimary ? 1.5 : 1}
        transparent
        opacity={opacity}
      />
      {isPrimary && (
        <>
          <DataPacket arcPoints={arcPoints} speed={0.008} delay={0} />
          <DataPacket arcPoints={arcPoints} speed={0.008} delay={0.5} />
        </>
      )}
    </group>
  );
};

// Server location marker
const LocationMarker = ({ position, name, region, isPrimary = false }: { 
  position: THREE.Vector3; 
  name: string; 
  region: string;
  isPrimary?: boolean;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const scale = isPrimary ? 1.2 : 1;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    meshRef.current.scale.setScalar(scale * (hovered ? 1.3 : pulse));
  });
  
  return (
    <group position={position}>
      {/* Outer glow ring */}
      <mesh>
        <ringGeometry args={[0.02, 0.04, 32]} />
        <meshBasicMaterial 
          color={isPrimary ? "#00d4ff" : "#8b5cf6"} 
          transparent 
          opacity={0.3} 
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Main marker */}
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <sphereGeometry args={[isPrimary ? 0.025 : 0.018, 16, 16]} />
        <meshBasicMaterial 
          color={isPrimary ? "#00d4ff" : "#8b5cf6"} 
          transparent 
          opacity={0.9}
        />
      </mesh>
      
      {/* Tooltip on hover */}
      {hovered && (
        <Html distanceFactor={10}>
          <div className="px-3 py-2 rounded-lg bg-card/90 backdrop-blur-sm border border-primary/30 whitespace-nowrap pointer-events-none">
            <p className="text-sm font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{region}</p>
            {isPrimary && (
              <span className="text-xs text-primary">● Primary Hub</span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};

// Globe mesh with realistic Earth texture
const Globe = ({ locations }: { locations: DatacenterLocation[] }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Load Earth textures
  const earthTexture = useLoader(THREE.TextureLoader, 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
  const bumpTexture = useLoader(THREE.TextureLoader, 'https://unpkg.com/three-globe/example/img/earth-topology.png');
  
  // Generate location positions
  const locationPositions = useMemo(() => {
    return locations.map(loc => ({
      ...loc,
      position: latLngToVector3(loc.latitude, loc.longitude, 1.02)
    }));
  }, [locations]);
  
  // Generate connections between primary hubs
  const connections = useMemo(() => {
    const primaryHubs = locationPositions.filter(loc => loc.is_primary_hub);
    const conns: Array<{ start: THREE.Vector3; end: THREE.Vector3; isPrimary: boolean }> = [];
    
    // Connect primary hubs to each other
    for (let i = 0; i < primaryHubs.length; i++) {
      for (let j = i + 1; j < primaryHubs.length; j++) {
        conns.push({
          start: primaryHubs[i].position,
          end: primaryHubs[j].position,
          isPrimary: true
        });
      }
    }
    
    // Connect non-primary to nearest primary
    const nonPrimary = locationPositions.filter(loc => !loc.is_primary_hub);
    nonPrimary.forEach(loc => {
      if (primaryHubs.length > 0) {
        const nearest = primaryHubs.reduce((prev, curr) => 
          loc.position.distanceTo(curr.position) < loc.position.distanceTo(prev.position) ? curr : prev
        );
        conns.push({
          start: loc.position,
          end: nearest.position,
          isPrimary: false
        });
      }
    });
    
    return conns;
  }, [locationPositions]);
  
  // Auto rotation - rotate entire group
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Main Earth globe */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial 
          map={earthTexture}
          bumpMap={bumpTexture}
          bumpScale={0.03}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
        {/* Inner atmosphere glow */}
        <mesh scale={1.02}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial 
            color="#f43f5e"
            transparent
            opacity={0.08}
            side={THREE.BackSide}
          />
        </mesh>
        
        {/* Outer atmosphere */}
        <mesh scale={1.15}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial 
            color="#f59e0b"
            transparent
            opacity={0.05}
            side={THREE.BackSide}
          />
        </mesh>
      
      {/* Location markers */}
      {locationPositions.map((loc) => (
        <LocationMarker
          key={loc.id}
          position={loc.position}
          name={loc.name}
          region={loc.region}
          isPrimary={loc.is_primary_hub}
        />
      ))}
      
      {/* Connection beams */}
      {connections.map((conn, index) => (
        <ConnectionBeam
          key={index}
          start={conn.start}
          end={conn.end}
          isPrimary={conn.isPrimary}
        />
      ))}
    </group>
  );
};

// Scene setup with lighting
const Scene = ({ locations }: { locations: DatacenterLocation[] }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 0.5, 2.8);
  }, [camera]);
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-5, -3, -5]} intensity={0.3} color="#4f46e5" />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#00d4ff" />
      
      <Globe locations={locations} />
      
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={1.8}
        maxDistance={4}
        autoRotate={false}
        rotateSpeed={0.5}
        enableDamping={true}
        dampingFactor={0.05}
      />
      
      <Stars />
    </>
  );
};

const Stars = () => {
  const points = useMemo(() => {
    const pts = new Float32Array(1500);
    for (let i = 0; i < 1500; i++) {
      pts[i] = (Math.random() - 0.5) * 30;
    }
    return pts;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#ffffff" transparent opacity={0.8} sizeAttenuation />
    </points>
  );
};

// Default datacenter locations
const defaultLocations: DatacenterLocation[] = [
  { id: '1', name: 'New York', region: 'North America', latitude: 40.7128, longitude: -74.0060, is_primary_hub: true },
  { id: '2', name: 'San Francisco', region: 'North America', latitude: 37.7749, longitude: -122.4194, is_primary_hub: true },
  { id: '3', name: 'London', region: 'Europe', latitude: 51.5074, longitude: -0.1278, is_primary_hub: true },
  { id: '4', name: 'Frankfurt', region: 'Europe', latitude: 50.1109, longitude: 8.6821, is_primary_hub: true },
  { id: '5', name: 'Singapore', region: 'Asia Pacific', latitude: 1.3521, longitude: 103.8198, is_primary_hub: true },
  { id: '6', name: 'Tokyo', region: 'Asia Pacific', latitude: 35.6762, longitude: 139.6503, is_primary_hub: true },
  { id: '7', name: 'Sydney', region: 'Oceania', latitude: -33.8688, longitude: 151.2093, is_primary_hub: true },
  { id: '8', name: 'Mumbai', region: 'Asia', latitude: 19.0760, longitude: 72.8777, is_primary_hub: true },
  { id: '9', name: 'São Paulo', region: 'South America', latitude: -23.5505, longitude: -46.6333, is_primary_hub: true },
  { id: '10', name: 'Toronto', region: 'North America', latitude: 43.6532, longitude: -79.3832, is_primary_hub: false },
  { id: '11', name: 'Los Angeles', region: 'North America', latitude: 34.0522, longitude: -118.2437, is_primary_hub: false },
  { id: '12', name: 'Chicago', region: 'North America', latitude: 41.8781, longitude: -87.6298, is_primary_hub: false },
  { id: '13', name: 'Paris', region: 'Europe', latitude: 48.8566, longitude: 2.3522, is_primary_hub: false },
  { id: '14', name: 'Amsterdam', region: 'Europe', latitude: 52.3676, longitude: 4.9041, is_primary_hub: false },
  { id: '15', name: 'Dubai', region: 'Middle East', latitude: 25.2048, longitude: 55.2708, is_primary_hub: false },
  { id: '16', name: 'Hong Kong', region: 'Asia', latitude: 22.3193, longitude: 114.1694, is_primary_hub: false },
  { id: '17', name: 'Seoul', region: 'Asia', latitude: 37.5665, longitude: 126.9780, is_primary_hub: false },
  { id: '18', name: 'Bangalore', region: 'Asia', latitude: 12.9716, longitude: 77.5946, is_primary_hub: false },
  { id: '19', name: 'Jakarta', region: 'Asia Pacific', latitude: -6.2088, longitude: 106.8456, is_primary_hub: false },
  { id: '20', name: 'Cape Town', region: 'Africa', latitude: -33.9249, longitude: 18.4241, is_primary_hub: false },
  { id: '21', name: 'Johannesburg', region: 'Africa', latitude: -26.2041, longitude: 28.0473, is_primary_hub: false },
  { id: '22', name: 'Dallas', region: 'North America', latitude: 32.7767, longitude: -96.7970, is_primary_hub: false },
  { id: '23', name: 'Miami', region: 'North America', latitude: 25.7617, longitude: -80.1918, is_primary_hub: false },
  { id: '24', name: 'Stockholm', region: 'Europe', latitude: 59.3293, longitude: 18.0686, is_primary_hub: false },
  { id: '25', name: 'Warsaw', region: 'Europe', latitude: 52.2297, longitude: 21.0122, is_primary_hub: false },
];

// Main component
const ThreeGlobe = () => {
  const [locations] = useState<DatacenterLocation[]>(defaultLocations);
  
  const stats = [
    { icon: Globe2, label: "Global Regions", value: "15+" },
    { icon: Server, label: "Data Centers", value: `${locations.length || 25}+` },
    { icon: Zap, label: "Avg. Latency", value: "<20ms" },
    { icon: Shield, label: "Uptime SLA", value: "99.99%" },
  ];
  
  return (
    <section id="global-map" className="relative py-16 sm:py-20 md:py-28 overflow-hidden bg-gradient-to-b from-background via-background/95 to-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase bg-primary/10 border border-primary/20 rounded-full text-primary">
            Global Infrastructure
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-gradient-x">
              Worldwide Network
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Deploy across our strategically positioned data centers for optimal performance and minimal latency worldwide
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:col-span-3 relative"
          >
            <div className="relative aspect-square max-h-[500px] sm:max-h-[550px] md:max-h-[600px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
              
              <Canvas
                camera={{ position: [0, 0.5, 2.8], fov: 45 }}
                style={{ background: 'transparent' }}
                dpr={[1, 2]}
              >
                <React.Suspense fallback={null}>
                  <Scene locations={locations} />
                </React.Suspense>
              </Canvas>
              
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-medium text-white/80">LIVE STATUS</span>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-white/60">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
                    <span>Primary Hub</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50" />
                    <span>Edge Node</span>
                  </div>
                </div>
                <span className="text-xs text-white/40 hidden sm:block">Drag to rotate • Scroll to zoom</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="lg:col-span-2 space-y-4"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.2, delay: 0.2 + index * 0.05 }}
                  className="group relative p-5 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.05] hover:border-primary/30 transition-all duration-300"
                >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2, delay: 0.4 }}
                className="pt-4"
              >
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our infrastructure spans across major cities worldwide, ensuring your applications run closer to your users with enterprise-grade reliability.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ThreeGlobe;
