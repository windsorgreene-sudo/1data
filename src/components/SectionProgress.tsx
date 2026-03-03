import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { 
  Home, 
  Users, 
  Zap, 
  Server, 
  Globe, 
  MessageSquare, 
  Rocket, 
  Headphones, 
  Mail,
  Check,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Section {
  id: string;
  name: string;
  icon: React.ElementType;
}

const sections: Section[] = [
  { id: "hero", name: "Home", icon: Home },
  { id: "trusted", name: "Trusted By", icon: Users },
  { id: "features", name: "Features", icon: Zap },
  { id: "services", name: "Services", icon: Server },
  { id: "infrastructure", name: "Infrastructure", icon: Globe },
  { id: "testimonials", name: "Testimonials", icon: MessageSquare },
  { id: "cta", name: "Get Started", icon: Rocket },
  { id: "support", name: "Support", icon: Headphones },
  { id: "contact", name: "Contact", icon: Mail },
];

const SectionProgress = () => {
  const [activeSection, setActiveSection] = useState("hero");
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY + window.innerHeight / 3;
    
    // Show sidebar after scrolling past hero
    setIsVisible(window.scrollY > 200);

    let currentSection = "hero";
    const completed: string[] = [];

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        const { offsetTop, offsetHeight } = element;
        
        if (scrollPosition >= offsetTop) {
          currentSection = section.id;
        }
        
        if (scrollPosition >= offsetTop + offsetHeight) {
          completed.push(section.id);
        }
      }
    });

    setActiveSection(currentSection);
    setCompletedSections(completed);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const activeIndex = sections.findIndex(s => s.id === activeSection);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          initial={{ opacity: 0, x: -100 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            width: isCollapsed ? 'auto' : 'auto'
          }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 25,
            mass: 0.8
          }}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden lg:block"
        >
          <motion.div 
            className="relative rounded-2xl bg-background/40 backdrop-blur-xl border border-primary/20 shadow-2xl overflow-hidden"
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Collapse toggle */}
            <motion.button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-background/80 backdrop-blur-md border border-primary/20 rounded-r-lg flex items-center justify-center hover:bg-primary/10 transition-colors z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-primary" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-primary" />
              )}
            </motion.button>

            <motion.div 
              className="p-3"
              layout
            >
              {/* Progress line background */}
              <div className="absolute left-1/2 top-6 bottom-6 w-[2px] -translate-x-1/2 bg-muted/30 rounded-full" />
              
              {/* Active progress line */}
              <motion.div 
                className="absolute left-1/2 top-6 w-[2px] -translate-x-1/2 bg-gradient-to-b from-primary via-primary to-primary/50 rounded-full"
                initial={{ height: 0 }}
                animate={{ 
                  height: `${(activeIndex / (sections.length - 1)) * (sections.length * 44 - 24)}px` 
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />

              <div className="relative flex flex-col gap-3">
                {sections.map((section, index) => {
                  const isActive = activeSection === section.id;
                  const isCompleted = completedSections.includes(section.id);
                  const Icon = section.icon;

                  return (
                    <motion.div 
                      key={section.id} 
                      className="relative flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 200,
                        damping: 20
                      }}
                    >
                      {/* Tooltip - only show when collapsed */}
                      <AnimatePresence>
                        {hoveredSection === section.id && isCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, x: -10, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -10, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="absolute left-full ml-3 whitespace-nowrap z-20"
                          >
                            <div className="px-3 py-1.5 rounded-lg bg-background/95 backdrop-blur-md border border-primary/30 shadow-lg">
                              <span className="text-sm font-medium text-foreground">
                                {section.name}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Section button */}
                      <motion.button
                        onClick={() => scrollToSection(section.id)}
                        onMouseEnter={() => setHoveredSection(section.id)}
                        onMouseLeave={() => setHoveredSection(null)}
                        className={`
                          relative w-8 h-8 rounded-full flex items-center justify-center
                          transition-all duration-300 cursor-pointer shrink-0
                          ${isActive 
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40" 
                            : isCompleted 
                              ? "bg-primary/20 text-primary" 
                              : "bg-muted/50 text-muted-foreground hover:bg-muted"
                          }
                        `}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isCompleted && !isActive ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}

                        {/* Active pulse ring */}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-primary"
                            animate={{ 
                              scale: [1, 1.5, 1.5],
                              opacity: [0.8, 0, 0]
                            }}
                            transition={{ 
                              duration: 1.5, 
                              repeat: Infinity,
                              ease: "easeOut"
                            }}
                          />
                        )}
                      </motion.button>

                      {/* Section name - only show when not collapsed */}
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`text-sm font-medium whitespace-nowrap overflow-hidden ${
                              isActive ? 'text-primary' : 'text-muted-foreground'
                            }`}
                          >
                            {section.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default SectionProgress;
