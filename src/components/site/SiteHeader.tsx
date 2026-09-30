import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowLeft, ArrowUpRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { EASE_IN_OUT, EASE_OUT } from "@/lib/motion";
import { NAV, SITE, GENERAL_MESSAGE, mailLink, whatsappLink } from "@/lib/site";
import { DEDICATED_FROM } from "@/lib/plans";
import { lockScroll, scrollToTarget } from "@/lib/scroll";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Logo } from "./Logo";
import { Action } from "./Action";
import { AccountMenu } from "./AccountMenu";

const BAR_KEY = "beam-bar-dismissed-v2";

const AnnouncementBar = ({ onClose }: { onClose: () => void }) => (
  <div className="relative border-b border-white/[0.06] bg-ink-2/90">
    <div className="shell flex h-9 items-center justify-center gap-3 pr-10 text-[12.5px] sm:pr-8">
      <span className="hidden font-mono text-[10.5px] uppercase tracking-[0.2em] text-beam sm:inline">New</span>
      <span className="hidden h-3 w-px bg-white/15 sm:inline-block" />
      <span className="truncate text-bone/80">
        Dedicated CPU now starts at <span className="text-bone">${DEDICATED_FROM}/mo</span>. Cores that are yours alone.
      </span>
      <Link
        to="/servers#general-purpose"
        className="group hidden shrink-0 items-center gap-1 font-medium text-bone underline-offset-4 hover:underline sm:inline-flex"
      >
        See the lineup
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-mute transition-colors hover:bg-white/[0.06] hover:text-bone"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  </div>
);

const MenuButton = ({ open, onClick }: { open: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={open ? "Close menu" : "Open menu"}
    aria-expanded={open}
    className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] lg:hidden"
  >
    <span
      className={cn(
        "absolute h-px w-4 bg-bone transition-transform duration-500 ease-out-expo",
        open ? "rotate-45" : "-translate-y-[3.5px]",
      )}
    />
    <span
      className={cn(
        "absolute h-px w-4 bg-bone transition-transform duration-500 ease-out-expo",
        open ? "-rotate-45" : "translate-y-[3.5px]",
      )}
    />
  </button>
);

interface SiteHeaderProps {
  mode?: "site" | "app";
}

export const SiteHeader = ({ mode = "site" }: SiteHeaderProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isAdmin = useIsAdmin(user);
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [barOpen, setBarOpen] = useState(() => {
    try {
      return localStorage.getItem(BAR_KEY) !== "1";
    } catch {
      return true;
    }
  });

  const isSite = mode === "site";

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    if (!isSite) return;
    if (y > 320 && y > prev + 4) setHidden(true);
    else if (y < prev - 4 || y < 120) setHidden(false);
  });

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const closeBar = () => {
    setBarOpen(false);
    try {
      localStorage.setItem(BAR_KEY, "1");
    } catch {
      return;
    }
  };

  const onLogoClick = () => {
    if (location.pathname === "/") scrollToTarget(0);
  };

  const showBar = isSite && barOpen && !scrolled;

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        initial={false}
        animate={{ y: hidden && !open ? "-100%" : "0%" }}
        transition={{ duration: 0.55, ease: EASE_OUT }}
      >
        <AnimatePresence initial={false}>
          {showBar && (
            <motion.div
              key="bar"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
              className="overflow-hidden"
            >
              <AnnouncementBar onClose={closeBar} />
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={cn(
            "relative transition-[background-color,border-color,backdrop-filter] duration-500",
            !isSite || scrolled || open
              ? "bg-ink/75 shadow-[inset_0_-1px_0_hsl(0_0%_100%/0.07)] backdrop-blur-xl backdrop-saturate-150"
              : "bg-transparent",
          )}
        >
          <div className={cn("flex h-16 items-center justify-between gap-6", isSite ? "shell" : "px-4 sm:px-6 lg:px-8")}>
            <Link to="/" onClick={onLogoClick} aria-label="Beam Server home" className="relative z-10">
              <Logo />
            </Link>

            {isSite ? (
              <nav
                aria-label="Main"
                className="absolute left-1/2 hidden -translate-x-1/2 items-center lg:flex"
                onMouseLeave={() => setHovered(null)}
              >
                {NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onMouseEnter={() => setHovered(item.to)}
                    onFocus={() => setHovered(item.to)}
                    className={({ isActive }) =>
                      cn(
                        "relative rounded-full px-4 py-2 text-[14px] transition-colors duration-300",
                        isActive ? "text-bone" : "text-bone/60 hover:text-bone",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {hovered === item.to && (
                          <motion.span
                            layoutId="nav-hover"
                            className="absolute inset-0 rounded-full bg-white/[0.07]"
                            transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
                          />
                        )}
                        <span className="relative">{item.label}</span>
                        {isActive && (
                          <motion.span
                            layoutId="nav-active"
                            className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-beam"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            ) : (
              <nav aria-label="App" className="hidden flex-1 items-center gap-1 md:flex">
                <Link
                  to="/"
                  className="ml-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-bone/60 transition-colors hover:bg-white/[0.05] hover:text-bone"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to site
                </Link>
                <Link
                  to="/pricing"
                  className="rounded-full px-3 py-1.5 text-sm text-bone/60 transition-colors hover:bg-white/[0.05] hover:text-bone"
                >
                  Pricing
                </Link>
                <Link
                  to="/support"
                  className="rounded-full px-3 py-1.5 text-sm text-bone/60 transition-colors hover:bg-white/[0.05] hover:text-bone"
                >
                  Support
                </Link>
              </nav>
            )}

            <div className="relative z-10 flex items-center gap-2.5">
              {user ? (
                <div className="hidden sm:block">
                  <AccountMenu user={user} isAdmin={isAdmin} onSignOut={signOut} />
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="hidden rounded-full px-3 py-2 text-[14px] text-bone/70 transition-colors hover:text-bone sm:inline-flex"
                >
                  Sign in
                </Link>
              )}
              {isSite && (
                <Action to="/pricing" size="sm" className="hidden sm:inline-flex">
                  Deploy a server
                </Action>
              )}
              {isSite ? (
                <MenuButton open={open} onClick={() => setOpen((v) => !v)} />
              ) : (
                user && (
                  <div className="sm:hidden">
                    <AccountMenu user={user} isAdmin={isAdmin} onSignOut={signOut} />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && isSite && (
          <motion.div
            key="menu"
            className="fixed inset-0 z-40 flex flex-col bg-ink lg:hidden"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.7, ease: EASE_IN_OUT }}
            data-lenis-prevent
          >
            <div className="absolute inset-0 bg-grid opacity-40 mask-radial" aria-hidden />
            <div className="shell relative flex flex-1 flex-col overflow-y-auto pb-8 pt-24">
              <nav aria-label="Mobile" className="flex flex-col">
                {NAV.map((item, i) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.18 + i * 0.05 }}
                  >
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-baseline justify-between border-b border-white/[0.07] py-4",
                          isActive ? "text-bone" : "text-bone/75",
                        )
                      }
                    >
                      <span className="flex items-baseline gap-4">
                        <span className="font-mono text-[11px] text-mute">0{i + 1}</span>
                        <span className="display text-[2.1rem] font-semibold leading-none tracking-[-0.04em]">
                          {item.label}
                        </span>
                      </span>
                      <span className="text-sm text-mute">{item.note}</span>
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              <motion.div
                className="mt-auto grid gap-3 pt-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.5 }}
              >
                {user ? (
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">Signed in</p>
                      <p className="truncate text-sm text-bone">{user.email}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Action to="/portal" size="sm" variant="secondary" icon="none">
                        Portal
                      </Action>
                      {isAdmin && (
                        <Action to="/admin" size="sm" variant="secondary" icon="none">
                          Admin
                        </Action>
                      )}
                      <Action size="sm" variant="secondary" icon="none" onClick={signOut}>
                        Sign out
                      </Action>
                    </div>
                  </div>
                ) : (
                  <Action to="/auth" variant="secondary" size="lg" icon="none" className="w-full">
                    Sign in to your portal
                  </Action>
                )}
                <Action to="/pricing" size="lg" className="w-full">
                  Deploy a server
                </Action>
                <div className="mt-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
                  <a href={whatsappLink(GENERAL_MESSAGE)} target="_blank" rel="noopener noreferrer" className="hover:text-bone">
                    WhatsApp
                  </a>
                  <a href={mailLink()} className="hover:text-bone">
                    {SITE.email}
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SiteHeader;
