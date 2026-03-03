import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import worldMapImage from "@/assets/world-map-large.jpg";

const GlobalMap = () => {
  const locations = [
    // North America
    { name: 'Toronto', region: 'Canada', position: { top: '22%', left: '19.5%' } },
    { name: 'Mexico City', region: 'Mexico', position: { top: '38.5%', left: '17%' } },
    { name: 'Atlanta', region: 'United States', position: { top: '33%', left: '20.5%' } },
    { name: 'Honolulu', region: 'United States', position: { top: '40%', left: '2%' } },
    { name: 'Chicago', region: 'United States', position: { top: '28%', left: '19%' } },
    { name: 'Dallas', region: 'United States', position: { top: '35%', left: '17%' } },
    { name: 'Los Angeles', region: 'United States', position: { top: '33%', left: '12%' } },
    { name: 'Miami', region: 'United States', position: { top: '39%', left: '21%' } },
    { name: 'New York', region: 'United States', position: { top: '27%', left: '22%' } },
    { name: 'San Francisco', region: 'United States', position: { top: '31%', left: '11%' } },
    { name: 'Seattle', region: 'United States', position: { top: '24%', left: '12%' } },
    
    // South America  
    { name: 'São Paulo', region: 'Brazil', position: { top: '60%', left: '26%' } },
    { name: 'Santiago', region: 'Chile', position: { top: '67%', left: '24%' } },
    { name: 'Buenos Aires', region: 'Argentina', position: { top: '65%', left: '25%' } },
    
    // Europe
    { name: 'Warsaw', region: 'Poland', position: { top: '23%', left: '54%' } },
    { name: 'Amsterdam', region: 'Netherlands', position: { top: '21%', left: '52%' } },
    { name: 'London', region: 'United Kingdom', position: { top: '22%', left: '50%' } },
    { name: 'Frankfurt', region: 'Germany', position: { top: '23%', left: '53%' } },
    { name: 'Paris', region: 'France', position: { top: '24%', left: '51%' } },
    { name: 'Madrid', region: 'Spain', position: { top: '30%', left: '49%' } },
    { name: 'Stockholm', region: 'Sweden', position: { top: '17%', left: '54%' } },
    { name: 'Milan', region: 'Italy', position: { top: '26%', left: '53%' } },
    { name: 'Helsinki', region: 'Finland', position: { top: '15%', left: '56%' } },
    
    // Asia Pacific
    { name: 'Tokyo', region: 'Japan', position: { top: '31%', left: '82%' } },
    { name: 'Seoul', region: 'Korea', position: { top: '29%', left: '79%' } },
    { name: 'Singapore', region: 'Singapore', position: { top: '50%', left: '76%' } },
    { name: 'Bangalore', region: 'India', position: { top: '46%', left: '70%' } },
    { name: 'Sydney', region: 'Australia', position: { top: '66%', left: '84%' } },
    { name: 'Melbourne', region: 'Australia', position: { top: '69%', left: '83%' } },
    { name: 'Mumbai', region: 'India', position: { top: '42%', left: '68%' } },
    { name: 'Delhi', region: 'India', position: { top: '39%', left: '70%' } },
    { name: 'Hong Kong', region: 'China', position: { top: '40%', left: '78%' } },
    { name: 'Taipei', region: 'Taiwan', position: { top: '40%', left: '79%' } },
    
    // Middle East & Africa
    { name: 'Tel Aviv', region: 'Israel', position: { top: '36%', left: '56%' } },
    { name: 'Dubai', region: 'UAE', position: { top: '40%', left: '59%' } },
    { name: 'Johannesburg', region: 'South Africa', position: { top: '63%', left: '57%' } },
    { name: 'Cairo', region: 'Egypt', position: { top: '34%', left: '55%' } },
    
    // Russia & Eastern Europe
    { name: 'Moscow', region: 'Russia', position: { top: '20%', left: '60%' } },
    { name: 'St. Petersburg', region: 'Russia', position: { top: '17%', left: '58%' } },
  ];

  const regions = Array.from(new Set(locations.map(location => location.region)));

  return (
    <section className="py-10 md:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Global Datacenter Network</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Our strategically located datacenters ensure low latency and high availability worldwide
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card className="overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-0 relative">
              {/* World Map Visual */}
              <div className="h-[400px] md:h-[600px] lg:h-[700px] relative overflow-hidden">
                {/* World Map Background */}
                <img 
                  src={worldMapImage} 
                  alt="World Map showing datacenter locations"
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-primary/20"></div>

                {/* Location Dots */}
                <div className="absolute inset-0">
                  {locations.map((location, index) => (
                    <div
                      key={index}
                      className="absolute group cursor-pointer"
                      style={{
                        top: location.position.top,
                        left: location.position.left,
                      }}
                    >
                      {/* Dot with enhanced blinking */}
                      <div className="w-3 h-3 md:w-4 md:h-4 bg-primary rounded-full group-hover:scale-150 transition-transform duration-200 animate-pulse shadow-lg shadow-primary/50 relative z-10" />
                      <div className="w-3 h-3 md:w-4 md:h-4 bg-primary/40 rounded-full absolute top-0 left-0 animate-ping" />
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-primary/20 rounded-full absolute -top-1.5 md:-top-2 -left-1.5 md:-left-2 animate-ping animation-delay-150" />
                      <div className="w-8 h-8 md:w-12 md:h-12 bg-primary/10 rounded-full absolute -top-2.5 md:-top-4 -left-2.5 md:-left-4 animate-ping animation-delay-300" />
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 md:px-3 py-1 md:py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                        <div className="text-xs md:text-sm font-semibold text-gray-900">{location.name}</div>
                        <div className="text-xs text-gray-600">{location.region}</div>
                        
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/95"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Regions Counter */}
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{locations.length}</div>
                    <div className="text-xs text-muted-foreground">locations</div>
                  </div>
                </div>

                {/* Bottom overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background/80 to-transparent"></div>
              </div>

              {/* Content overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold mb-2 text-white drop-shadow-lg">Global Infrastructure</h3>
                  <p className="text-white/90 text-sm drop-shadow">
                    {locations.length} locations across {regions.length} regions worldwide
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8 md:mt-12 lg:mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary mb-2">{locations.length}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Global Locations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary mb-2">99.9%</div>
            <div className="text-xs md:text-sm text-muted-foreground">Uptime SLA</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary mb-2">&lt;50ms</div>
            <div className="text-xs md:text-sm text-muted-foreground">Average Latency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-xs md:text-sm text-muted-foreground">Global Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobalMap;