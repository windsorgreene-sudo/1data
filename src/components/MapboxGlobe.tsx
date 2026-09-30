import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { GlobeSkeleton } from '@/components/ui/loading-skeleton';
import { motion } from 'framer-motion';

interface VPSLocation {
  name: string;
  region: string;
  coordinates: [number, number]; // [longitude, latitude]
  isPrimary?: boolean; // Primary hub locations
}

const MapboxGlobe = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [vpsLocations, setVpsLocations] = useState<VPSLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const animationFrameRef = useRef<number | null>(null);
  const dataPacketsRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Fetch Mapbox token and datacenter locations in parallel
      const [tokenResponse, locationsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-mapbox-token`),
        supabase.from('datacenter_locations').select('*').eq('status', 'active')
      ]);

      // Handle token
      try {
        const tokenData = await tokenResponse.json();
        if (tokenData.token) {
          setMapboxToken(tokenData.token);
        } else if (tokenData.error) {
          console.error('Error from edge function:', tokenData.error);
        }
      } catch (error) {
        console.error('Failed to fetch Mapbox token:', error);
      }

      // Handle locations
      if (locationsResponse.data && locationsResponse.data.length > 0) {
        const locations: VPSLocation[] = locationsResponse.data.map((loc) => ({
          name: loc.name,
          region: loc.region,
          coordinates: [loc.longitude, loc.latitude] as [number, number],
          isPrimary: loc.is_primary_hub || false,
        }));
        setVpsLocations(locations);
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || vpsLocations.length === 0) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      projection: { name: 'globe' },
      zoom: 1.5,
      center: [20, 20],
      pitch: 0,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add atmosphere and fog effects
    map.current.on('style.load', () => {
      if (!map.current) return;

      map.current.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6,
      });

      // Add markers for each VPS location
      vpsLocations.forEach((location) => {
        // Create custom marker element with different styles for primary hubs
        const el = document.createElement('div');
        el.className = location.isPrimary ? 'vps-marker-primary' : 'vps-marker';
        
        if (location.isPrimary) {
          // Primary hub styling - larger, more prominent, with pulse animation
          el.style.width = '14px';
          el.style.height = '14px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = 'hsl(var(--primary))';
          el.style.boxShadow = '0 0 15px 4px hsl(var(--primary) / 0.9), 0 0 30px 8px hsl(var(--primary) / 0.6), 0 0 45px 12px hsl(var(--primary) / 0.3)';
          el.style.cursor = 'pointer';
          el.style.border = '2px solid hsl(var(--primary))';
          el.style.animation = 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite';
          el.style.zIndex = '100';
          
          // Add inner glow ring for primary locations
          const innerRing = document.createElement('div');
          innerRing.style.position = 'absolute';
          innerRing.style.top = '50%';
          innerRing.style.left = '50%';
          innerRing.style.transform = 'translate(-50%, -50%)';
          innerRing.style.width = '6px';
          innerRing.style.height = '6px';
          innerRing.style.borderRadius = '50%';
          innerRing.style.backgroundColor = 'white';
          innerRing.style.boxShadow = '0 0 8px 2px white';
          el.appendChild(innerRing);
        } else {
          // Regular location styling - smaller, subtle
          el.style.width = '8px';
          el.style.height = '8px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = 'hsl(var(--primary))';
          el.style.boxShadow = '0 0 10px 2px hsl(var(--primary) / 0.6), 0 0 20px 4px hsl(var(--primary) / 0.4), 0 0 30px 6px hsl(var(--primary) / 0.2)';
          el.style.cursor = 'pointer';
          el.style.border = '1px solid hsl(var(--primary) / 0.8)';
        }

        // Create popup with badge for primary hubs
        const primaryBadge = location.isPrimary 
          ? '<span style="background: hsl(var(--primary)); color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 4px;">HUB</span>'
          : '';
        
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
          `<div style="padding: 8px; background: hsl(var(--card)); border: 1px solid hsl(var(--primary) / 0.3); border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" stroke-width="2">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                <line x1="6" y1="6" x2="6.01" y2="6"></line>
                <line x1="6" y1="18" x2="6.01" y2="18"></line>
              </svg>
              <strong style="color: hsl(var(--foreground)); font-size: 14px;">${location.name}</strong>
              ${primaryBadge}
            </div>
            <div style="color: hsl(var(--muted-foreground)); font-size: 12px; margin-top: 4px;">${location.region}</div>
          </div>`
        );

        // Add marker to map
        new mapboxgl.Marker(el)
          .setLngLat(location.coordinates)
          .setPopup(popup)
          .addTo(map.current!);

        // Show popup on hover
        el.addEventListener('mouseenter', () => popup.addTo(map.current!));
        el.addEventListener('mouseleave', () => popup.remove());
      });

      // Add animated arcs between primary hub locations
      const primaryHubs = vpsLocations.filter(loc => loc.isPrimary);
      const connections: [VPSLocation, VPSLocation][] = [];
      
      // Connect each primary hub to nearby primary hubs (based on distance)
      primaryHubs.forEach((hub, i) => {
        // Connect to up to 3 nearest hubs
        const otherHubs = primaryHubs.filter((_, j) => j !== i);
        const sortedByDistance = otherHubs.sort((a, b) => {
          const distA = Math.sqrt(
            Math.pow(a.coordinates[0] - hub.coordinates[0], 2) + 
            Math.pow(a.coordinates[1] - hub.coordinates[1], 2)
          );
          const distB = Math.sqrt(
            Math.pow(b.coordinates[0] - hub.coordinates[0], 2) + 
            Math.pow(b.coordinates[1] - hub.coordinates[1], 2)
          );
          return distA - distB;
        });
        
        // Connect to 2-3 nearest hubs
        sortedByDistance.slice(0, 3).forEach(nearbyHub => {
          // Avoid duplicate connections
          const exists = connections.some(conn => 
            (conn[0].name === hub.name && conn[1].name === nearbyHub.name) ||
            (conn[1].name === hub.name && conn[0].name === nearbyHub.name)
          );
          if (!exists) {
            connections.push([hub, nearbyHub]);
          }
        });
      });

      const arcFeatures = connections.map((conn, idx) => {
        const [start, end] = conn;
        return {
          type: 'Feature' as const,
          properties: { id: idx },
          geometry: {
            type: 'LineString' as const,
            coordinates: [start.coordinates, end.coordinates],
          },
        };
      });

      map.current.addSource('arcs', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: arcFeatures,
        },
      });

      map.current.addLayer({
        id: 'arcs-layer',
        type: 'line',
        source: 'arcs',
        paint: {
          'line-color': 'hsl(var(--primary))',
          'line-width': 2,
          'line-opacity': 0.4,
        },
      });

      // Create animated data packets
      const dataPackets: Array<{
        marker: mapboxgl.Marker;
        connection: [VPSLocation, VPSLocation];
        progress: number;
        speed: number;
      }> = [];

      connections.forEach((connection, idx) => {
        // Create 2 packets per connection with different starting positions
        for (let i = 0; i < 2; i++) {
          const el = document.createElement('div');
          el.className = 'data-packet';
          el.style.width = '6px';
          el.style.height = '6px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = 'hsl(var(--primary))';
          el.style.boxShadow = '0 0 8px 3px hsl(var(--primary) / 0.8), 0 0 16px 6px hsl(var(--primary) / 0.5)';
          el.style.border = '1px solid hsl(var(--primary))';
          el.style.zIndex = '1000';

          const marker = new mapboxgl.Marker(el)
            .setLngLat(connection[0].coordinates)
            .addTo(map.current!);

          dataPackets.push({
            marker,
            connection,
            progress: i * 0.5, // Stagger starting positions
            speed: 0.003 + Math.random() * 0.002, // Varying speeds
          });

          dataPacketsRef.current.push(marker);
        }
      });

      // Animation function
      function animatePackets() {
        dataPackets.forEach((packet) => {
          packet.progress += packet.speed;
          
          if (packet.progress > 1) {
            packet.progress = 0;
          }

          const [start, end] = packet.connection;
          const lng = start.coordinates[0] + (end.coordinates[0] - start.coordinates[0]) * packet.progress;
          const lat = start.coordinates[1] + (end.coordinates[1] - start.coordinates[1]) * packet.progress;

          packet.marker.setLngLat([lng, lat]);
        });

        animationFrameRef.current = requestAnimationFrame(animatePackets);
      }

      animatePackets();
    });

    // Smooth continuous rotation using requestAnimationFrame
    const secondsPerRevolution = 60;
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;
    let userInteracting = false;
    let lastTime = performance.now();
    let rotationAnimationId: number | null = null;

    function smoothSpinGlobe(currentTime: number) {
      if (!map.current) return;
      
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;
      
      if (!userInteracting) {
        const zoom = map.current.getZoom();
        if (zoom < maxSpinZoom) {
          let distancePerSecond = 360 / secondsPerRevolution;
          if (zoom > slowSpinZoom) {
            const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
            distancePerSecond *= zoomDif;
          }
          const center = map.current.getCenter();
          center.lng -= distancePerSecond * deltaTime;
          map.current.setCenter(center);
        }
      }
      
      rotationAnimationId = requestAnimationFrame(smoothSpinGlobe);
    }

    map.current.on('mousedown', () => { userInteracting = true; });
    map.current.on('dragstart', () => { userInteracting = true; });
    map.current.on('mouseup', () => { userInteracting = false; });
    map.current.on('touchend', () => { userInteracting = false; });

    // Start smooth continuous rotation
    rotationAnimationId = requestAnimationFrame(smoothSpinGlobe);

    return () => {
      // Clean up rotation animation
      if (rotationAnimationId) {
        cancelAnimationFrame(rotationAnimationId);
      }
      // Clean up data packet animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Clean up data packet markers
      dataPacketsRef.current.forEach(marker => marker.remove());
      dataPacketsRef.current = [];
      
      map.current?.remove();
    };
  }, [mapboxToken, vpsLocations]);

  if (isLoading || !mapboxToken || vpsLocations.length === 0) {
    return <GlobeSkeleton />;
  }

  return (
    <section id="locations" className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[image:var(--gradient-surface)] opacity-50"></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-3 bg-[image:var(--text-gradient)] bg-clip-text text-transparent">
            Global RDP VPS Network
          </h2>
          <p className="text-lg text-muted-foreground">
            {vpsLocations.length} datacenters worldwide • Interactive 3D globe
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-premium">
            <CardContent className="p-0">
              <div 
                ref={mapContainer}
                className="w-full h-[600px] rounded-lg"
                style={{ background: 'rgb(10, 10, 20)' }}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>🌍 Drag to rotate • Scroll to zoom • Click markers for details</p>
        </motion.div>
      </div>
    </section>
  );
};

export default MapboxGlobe;
