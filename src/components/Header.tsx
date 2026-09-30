import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import BeamLogo from "@/components/BeamLogo";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Menu, X, User, LogOut, Shield, Flame, Clock, Sparkles, Copy, Check, Zap, Tag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getSaleEnd = () => {
  const stored = localStorage.getItem("beam-sale-end");
  if (stored) {
    const end = new Date(parseInt(stored));
    if (end > new Date()) return end;
  }
  const newEnd = new Date(Date.now() + 47 * 60 * 1000 + 33 * 1000);
  localStorage.setItem("beam-sale-end", newEnd.getTime().toString());
  return newEnd;
};

const PROMO_CODE = "BEAM30";

const FlashSaleBanner = ({ onDismiss }: { onDismiss: () => void }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 47, s: 33 });
  const [copied, setCopied] = useState(false);
  const [pulse, setPulse] = useState(false);
  const endTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    endTimeRef.current = getSaleEnd();
    const tick = () => {
      if (!endTimeRef.current) return;
      const diff = endTimeRef.current.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ h: 0, m: 0, s: 0 }); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setPulse(p => !p), 1000);
    return () => clearInterval(id);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(PROMO_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-rose-600/95 via-purple-700/95 to-indigo-600/95" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.15) 70%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmerMove 3s linear infinite",
        }}
      />
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative py-2 sm:py-2.5 px-10 sm:px-14">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
          <motion.div
            animate={{ scale: pulse ? 1.25 : 1, rotate: pulse ? -8 : 8 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex-shrink-0 hidden sm:flex"
          >
            <Flame size={15} className="text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.9)]" />
          </motion.div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <Zap size={11} className="text-yellow-300 hidden xs:block" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/90">
              Flash Sale
            </span>
          </div>

          <div className="w-[1px] h-4 bg-white/20 hidden sm:block" />

          <motion.div
            animate={{ scale: pulse ? 1.05 : 1 }}
            transition={{ duration: 0.4 }}
            className="flex-shrink-0 flex items-center gap-1"
          >
            <span className="bg-white text-purple-700 text-[10px] sm:text-xs font-black px-2 sm:px-2.5 py-0.5 rounded-full shadow-lg shadow-white/20 tracking-wide">
              30% OFF
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-white/80 uppercase tracking-wide hidden sm:inline">All Plans</span>
          </motion.div>

          <div className="w-[1px] h-4 bg-white/20 hidden md:block" />

          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            <Clock size={10} className="text-yellow-200/80 hidden sm:block" />
            <span className="text-[9px] sm:text-[10px] text-white/60 font-semibold uppercase tracking-wider hidden sm:inline">Ends in</span>
              <div className="flex items-center gap-0.5 sm:gap-1">
                {([timeLeft.h > 0 ? pad(timeLeft.h) : null, pad(timeLeft.m), pad(timeLeft.s)].filter(Boolean) as string[]).map((unit, i, arr) => (
                  <div key={i} className="flex items-center gap-0.5 sm:gap-1">
                    <motion.div
                      key={unit}
                      initial={{ y: -6, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="bg-black/30 backdrop-blur-sm border border-white/20 rounded px-1 sm:px-1.5 py-0.5 min-w-[22px] sm:min-w-[26px] text-center"
                    >
                      <span className="text-[11px] sm:text-xs font-black text-white tabular-nums leading-none">{unit}</span>
                    </motion.div>
                    {i < arr.length - 1 && (
                      <motion.span
                        animate={{ opacity: pulse ? 1 : 0.3 }}
                        transition={{ duration: 0.3 }}
                        className="text-white/70 font-bold text-xs leading-none"
                      >
                        :
                      </motion.span>
                    )}
                  </div>
                ))}
              </div>
          </div>

          <div className="w-[1px] h-4 bg-white/20 hidden lg:block" />

          <motion.button
            onClick={handleCopy}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="hidden lg:flex items-center gap-1.5 bg-black/25 hover:bg-black/40 border border-white/25 hover:border-white/50 rounded-lg px-2.5 py-1 transition-all duration-200 group flex-shrink-0"
          >
            <Tag size={10} className="text-yellow-300" />
            <span className="text-[10px] font-black tracking-[0.2em] text-white">{PROMO_CODE}</span>
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Check size={10} className="text-green-300" />
                </motion.div>
              ) : (
                <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Copy size={10} className="text-white/50 group-hover:text-white/80 transition-colors" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            onClick={() => navigate('/pricing')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:flex flex-shrink-0 items-center gap-1 bg-white/15 hover:bg-white/25 border border-white/30 hover:border-white/60 rounded-full px-2.5 sm:px-3 py-1 transition-all duration-200 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white"
          >
            <Sparkles size={9} className="text-yellow-300" />
            Claim Now
          </motion.button>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 border border-white/20 hover:border-white/40 transition-all duration-200 text-white/60 hover:text-white"
        aria-label="Dismiss banner"
      >
        <X size={10} />
      </button>
    </div>
  );
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { scrollY } = useScroll();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState("home");
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return localStorage.getItem("beam-banner-dismissed") === "true";
  });

  const scrollYSpring = useSpring(scrollY, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const updateScrolled = (latest: number) => {
      if (latest > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    const unsubscribe = scrollY.on("change", updateScrolled);
    return () => unsubscribe();
  }, [scrollY]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem("beam-banner-dismissed", "true");
  };

  const navItems = useMemo(() => [
    { label: "Home", id: "home", type: "anchor" as const },
    { label: "Features", id: "features", type: "anchor" as const },
    { label: "Services", id: "services", type: "anchor" as const },
    { label: "Pricing", path: "/pricing", type: "route" as const },
    { label: "Contact", id: "contact", type: "anchor" as const },
  ], []);

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    const lenis = (window as any).__lenis;
    if (lenis) {
      lenis.scrollTo(element, { offset: -80, duration: 1.2 });
    } else {
      const elementTop = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementTop - 80, behavior: "smooth" });
    }
  }, []);

  const handleNavClick = useCallback((item: typeof navItems[0]) => {
    setIsMobileMenuOpen(false);

    if (item.type === "route") {
      navigate(item.path!);
      return;
    }

    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: item.id } });
      return;
    }

    scrollToSection(item.id!);
  }, [location.pathname, navigate, scrollToSection, navItems]);

  useEffect(() => {
    if (location.pathname !== "/") {
      const currentRouteItem = navItems.find(item => item.type === "route" && location.pathname === item.path);
      if (currentRouteItem) {
        setActiveNav(currentRouteItem.label.toLowerCase());
      } else {
        setActiveNav("");
      }
      return;
    }

    const observers = navItems
      .filter(item => item.type === "anchor")
      .map((item) => {
        const element = document.getElementById(item.id!);
        if (!element) return null;

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setActiveNav(item.id!);
              }
            });
          },
          { 
            rootMargin: "-20% 0px -70% 0px",
            threshold: 0 
          }
        );

        observer.observe(element);
        return observer;
      });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, [location.pathname, navItems]);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();
    setIsAdmin(!!data);
  };

  const menuVariants = {
    closed: { opacity: 0, scale: 0.95, filter: "blur(10px)", transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.05, staggerDirection: -1 } },
    open: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.07, delayChildren: 0.1 } }
  };

  const itemVariants = {
    closed: { opacity: 0, y: 20 },
    open: { opacity: 1, y: 0 }
  };

  const showHeaderBanner = !bannerDismissed;

  return (
    <>
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
          <motion.div 
            className="mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto"
            animate={{
              paddingTop: isScrolled ? 10 : 0,
              paddingBottom: isScrolled ? 10 : 0,
            }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div 
              className="mx-auto relative overflow-hidden"
              layout
              animate={{
                maxWidth: isScrolled ? "1100px" : "1400px",
                borderRadius: isScrolled ? "1.75rem" : "0rem",
                boxShadow: isScrolled 
                  ? "0 20px 40px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 50px rgba(0, 229, 255, 0.1)"
                  : "0 0 0 0 rgba(0, 0, 0, 0)",
              }}
              transition={{ 
                duration: 0.6, 
                ease: [0.16, 1, 0.3, 1],
                layout: { duration: 0.6 }
              }}
            >
              <div className={`absolute inset-0 transition-all duration-700 ${
                isScrolled ? "bg-[#0a0a12]/85" : "bg-[#0a0a12]/98"
              }`} />
              
              <div className="absolute inset-0 backdrop-blur-3xl" />
            
            <div className={`absolute inset-0 transition-all duration-1000 ${
              isScrolled
                ? "bg-gradient-to-r from-cyan-500/15 via-purple-500/10 to-pink-500/15 opacity-100"
                : "bg-gradient-to-r from-cyan-500/5 via-transparent to-pink-500/5 opacity-40"
            }`} />
            
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isScrolled ? "opacity-100" : "opacity-0"}`}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
            </div>
            
            <div className={`absolute inset-x-0 bottom-0 h-[1px] transition-all duration-700 ${
              isScrolled 
                ? "bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" 
                : "bg-gradient-to-r from-transparent via-white/10 to-transparent"
            }`} />
            
            <div className={`absolute inset-x-0 top-0 h-[1px] transition-all duration-700 ${
              isScrolled 
                ? "bg-gradient-to-r from-transparent via-purple-500/30 to-transparent opacity-100" 
                : "opacity-0"
            }`} />

            <AnimatePresence mode="wait">
              {showHeaderBanner && !isScrolled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <FlashSaleBanner onDismiss={handleDismissBanner} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between transition-all duration-500">
              <motion.button 
                onClick={() => handleNavClick(navItems[0])}
                className="flex items-center gap-2.5 sm:gap-3 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-50 blur-md transition-all duration-500" />
                  <BeamLogo
                    size={44}
                    className="relative w-9 h-9 sm:w-11 sm:h-11 drop-shadow-[0_0_10px_rgba(0,229,255,0.6)] group-hover:drop-shadow-[0_0_20px_rgba(0,229,255,0.9)] transition-all duration-500"
                  />
                </div>
                <div className="flex flex-col leading-none">
                  <div className="flex items-center gap-[3px]">
                    <span
                      className="text-[17px] sm:text-[19px] font-black tracking-[-0.01em]"
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
                      className="text-[17px] sm:text-[19px] font-black tracking-[-0.01em]"
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
                    className="text-[8px] sm:text-[9px] font-semibold tracking-[0.28em] uppercase hidden sm:block mt-[3px]"
                    style={{ color: "rgba(255,255,255,0.28)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Cloud Infrastructure
                  </span>
                </div>
              </motion.button>
              
              <nav className="hidden lg:flex items-center">
                <div className="flex items-center bg-white/[0.03] rounded-full p-1 border border-white/[0.05]">
                  {navItems.map((item, index) => {
                    const isActive = activeNav === (item.id || item.label.toLowerCase());
                    return (
                      <motion.button 
                        key={item.label}
                        onClick={() => handleNavClick(item)}
                        className={`relative px-4 xl:px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                          isActive 
                            ? "text-white" 
                            : "text-white/50 hover:text-white/80"
                        }`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 + 0.2 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="navIndicator"
                            className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full border border-white/10 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                          >
                            <div className="absolute inset-0 rounded-full bg-cyan-500/5 blur-sm" />
                          </motion.div>
                        )}
                        <span className="relative z-10">{item.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </nav>

              <motion.div 
                className="hidden lg:flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="relative h-10 px-4 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-full border border-white/10 hover:border-white/20 transition-all duration-300"
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center mr-2">
                          <User className="h-3.5 w-3.5 text-white" />
                        </div>
                        Account
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-56 bg-[#0f0f1a]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl shadow-black/50"
                    >
                      <DropdownMenuLabel className="font-normal px-4 py-3">
                        <p className="text-sm font-medium text-white">{user.email}</p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem 
                        onClick={() => navigate('/portal')} 
                        className="cursor-pointer px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 focus:bg-white/5 rounded-lg mx-2"
                      >
                        <User className="h-4 w-4 mr-3 text-cyan-400" />
                        Customer Portal
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem 
                          onClick={() => navigate('/admin')} 
                          className="cursor-pointer px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 focus:bg-white/5 rounded-lg mx-2"
                        >
                          <Shield className="h-4 w-4 mr-3 text-purple-400" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem 
                        onClick={() => signOut()} 
                        className="cursor-pointer px-4 py-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 focus:bg-rose-500/10 rounded-lg mx-2 mb-2"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    size="sm"
                    className="relative h-10 px-6 text-sm font-semibold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white rounded-full overflow-hidden group shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
                    onClick={() => navigate('/auth')}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Sign In
                    </span>
                  </Button>
                )}
              </motion.div>

              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden relative w-10 h-10 flex items-center justify-center text-white/70 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div 
                      key="close" 
                      initial={{ rotate: -90, opacity: 0 }} 
                      animate={{ rotate: 0, opacity: 1 }} 
                      exit={{ rotate: 90, opacity: 0 }} 
                      transition={{ duration: 0.2 }}
                    >
                      <X size={20} />
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="menu" 
                      initial={{ rotate: 90, opacity: 0 }} 
                      animate={{ rotate: 0, opacity: 1 }} 
                      exit={{ rotate: -90, opacity: 0 }} 
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={20} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div 
              className="absolute inset-0 bg-[#0a0a12]/95 backdrop-blur-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
            </div>
            
            <motion.div 
              className="relative pt-24 pb-12 px-6 h-full flex flex-col justify-between"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <nav className="space-y-3">
                {navItems.map((item, idx) => {
                  const isActive = activeNav === (item.id || item.label.toLowerCase());
                  return (
                    <motion.button 
                      key={item.label}
                      onClick={() => handleNavClick(item)}
                      className={`block w-full text-left text-2xl font-bold rounded-2xl px-6 py-5 transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 text-white border border-white/15 shadow-[0_0_30px_rgba(0,229,255,0.1)]"
                          : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                      variants={itemVariants}
                      whileHover={{ x: 10, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <span>{item.label}</span>
                        {isActive && <motion.div layoutId="mobileActive" className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#00e5ff]" />}
                      </div>
                    </motion.button>
                  );
                })}
              </nav>

              <motion.div className="pt-8 border-t border-white/10" variants={itemVariants}>
                {user ? (
                  <div className="space-y-3">
                    <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white/90">Signed in as</span>
                        <span className="text-xs text-white/50 truncate max-w-[180px]">{user.email}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-14 text-base text-white/70 hover:text-white hover:bg-white/5 rounded-2xl border border-transparent hover:border-white/10 px-6"
                        onClick={() => { navigate('/portal'); setIsMobileMenuOpen(false); }}
                      >
                        <User className="h-5 w-5 mr-4 text-cyan-400" />
                        Customer Portal
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-14 text-base text-white/70 hover:text-white hover:bg-white/5 rounded-2xl border border-transparent hover:border-white/10 px-6"
                          onClick={() => { navigate('/admin'); setIsMobileMenuOpen(false); }}
                        >
                          <Shield className="h-5 w-5 mr-4 text-purple-400" />
                          Admin Dashboard
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-14 text-base text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-2xl border border-transparent hover:border-rose-500/10 px-6 mt-4"
                        onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                      >
                        <LogOut className="h-5 w-5 mr-4" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full h-16 text-lg font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white rounded-2xl shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
                    onClick={() => { navigate('/auth'); setIsMobileMenuOpen(false); }}
                  >
                    <Sparkles className="w-6 h-6 mr-3" />
                    Sign In to Beam
                  </Button>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
