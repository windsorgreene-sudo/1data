import { motion } from "framer-motion";
import { TextReveal } from "./TextReveal";

const companies = [
  "TechCorp", "DataFlow", "CloudNine", "ByteScale", "NetForce",
  "CyberShield", "QuantumLeap", "StreamLine", "DigiCore", "FlexHost"
];

const TrustedBy = () => {
  return (
    <section className="relative py-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
      
      <div className="relative z-10 container mx-auto px-6">
        <p className="text-center text-muted-foreground text-sm uppercase tracking-wider mb-8">
          <TextReveal animation="fade" type="words" staggerDelay={0.05}>
            Trusted by industry leaders worldwide
          </TextReveal>
        </p>
        
        {/* Marquee container */}
        <div className="relative overflow-hidden">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
          
          {/* Marquee track */}
          <div className="flex marquee">
            {/* Three sets for seamless infinite loop */}
            {[...companies, ...companies, ...companies].map((company, index) => (
              <div
                key={index}
                className="flex-shrink-0 mx-8 flex items-center justify-center"
              >
                <div className="px-8 py-4 rounded-lg glass-effect opacity-60 hover:opacity-100 transition-opacity duration-300">
                  <span className="text-xl font-bold text-foreground/70 tracking-wide">
                    {company}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;