import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, MessageCircle, ArrowUpRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");

  const scrollToSection = (sectionId: string) => {
    if (location.pathname === '/') {
      const lenis = (window as any).__lenis;
      const el = document.getElementById(sectionId);
      if (lenis && el) {
        lenis.scrollTo(el, { offset: -80, duration: 1.2 });
      } else if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/', { state: { scrollTo: sectionId } });
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thanks for subscribing!", {
        description: "You'll receive updates about Beam Server."
      });
      setEmail("");
    }
  };

  return (
    <footer className="relative overflow-hidden border-t border-glass">
      {/* Background */}
      <div className="absolute inset-0 aurora-bg opacity-50" />
      
      {/* Beam lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-beam" />

      <div className="container mx-auto px-3 sm:px-6 py-8 sm:py-12 lg:py-16 xl:py-20 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-2 space-y-3 sm:space-y-6">
            <div className="flex items-center gap-2.5 sm:gap-3">
                <img
                  src="/beam-logo.svg"
                  alt="Beam Server Logo"
                  className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-[0_0_8px_rgba(0,212,255,0.4)]"
                />
                  <div className="flex flex-col leading-none">
                    <div className="flex items-center gap-[3px]">
                      <span
                        className="text-[17px] sm:text-[18px] font-black tracking-[-0.01em]"
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        BEAM
                      </span>
                      <span
                        className="text-[17px] sm:text-[18px] font-black tracking-[-0.01em]"
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          background: "linear-gradient(135deg, #00e5ff 0%, #7c3aed 60%, #c026d3 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        SERVER
                      </span>
                    </div>
                    <span
                      className="text-[8px] font-semibold tracking-[0.28em] uppercase mt-[3px]"
                      style={{ color: "rgba(255,255,255,0.28)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      Cloud Infrastructure
                    </span>
                  </div>
              </div>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-xs">
              Next-generation cloud infrastructure powered by cutting-edge technology. Deploy servers at the speed of light.
            </p>
            
            {/* Newsletter */}
            <form onSubmit={handleNewsletterSubmit} className="pt-1 sm:pt-2">
              <p className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-3">Subscribe to updates</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary/50 border-glass focus:border-primary/50 h-10 text-sm"
                />
                <Button type="submit" size="sm" className="bg-gradient-primary text-primary-foreground h-10 px-4">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
            
            {/* Social */}
            <div className="flex items-center gap-3 pt-1 sm:pt-2">
              <a 
                href="https://wa.me/917701931693" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl frosted-card flex items-center justify-center transition-all hover:scale-110 hover:shadow-glow group"
              >
                <MessageCircle className="w-5 h-5 text-primary" />
              </a>
              <a 
                href="mailto:supportbeam@gmail.com"
                className="w-10 h-10 rounded-xl frosted-card flex items-center justify-center transition-all hover:scale-110 hover:shadow-glow group"
              >
                <Mail className="w-5 h-5 text-primary" />
              </a>
            </div>
          </div>
          
          {/* Services */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider">Services</h4>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { label: "Cloud RDP", action: () => scrollToSection('services') },
                { label: "VPS Hosting", action: () => scrollToSection('services') },
                { label: "Pricing", action: () => scrollToSection('pricing') },
              ].map((item) => (
                <li key={item.label}>
                  <button 
                    onClick={item.action}
                    className="text-muted-foreground hover:text-primary text-xs sm:text-sm transition-colors flex items-center gap-1.5 group"
                  >
                    {item.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { label: "About Us", action: () => navigate('/about') },
                { label: "Features", action: () => scrollToSection('features') },
                { label: "Locations", action: () => scrollToSection('global-map') },
                { label: "Testimonials", action: () => navigate('/testimonials') },
              ].map((item) => (
                <li key={item.label}>
                  <button 
                    onClick={item.action}
                    className="text-muted-foreground hover:text-primary text-xs sm:text-sm transition-colors flex items-center gap-1.5 group"
                  >
                    {item.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { label: "Help Center", action: () => navigate('/support') },
                { label: "Contact Us", action: () => navigate('/support') },
                { label: "WhatsApp", action: () => window.open('https://wa.me/917701931693', '_blank') },
                { label: "FAQ", action: () => navigate('/support') },
              ].map((item) => (
                <li key={item.label}>
                  <button 
                    onClick={item.action}
                    className="text-muted-foreground hover:text-primary text-xs sm:text-sm transition-colors flex items-center gap-1.5 group"
                  >
                    {item.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-glass mt-6 sm:mt-10 md:mt-12 pt-4 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          <p className="text-muted-foreground text-xs sm:text-sm text-center sm:text-left">
            © {currentYear} Beam Server. All rights reserved.
          </p>
          <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;