import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense, useCallback, useState } from "react";
import HoverReceiver from "@/visual-edits/VisualEditsMessenger";
import { SiteLayout, PageLoading } from "@/components/site/SiteLayout";
import { IntroProvider } from "@/components/site/IntroContext";
import { Preloader } from "@/components/site/Preloader";
import { prefersReducedMotion } from "@/lib/motion";
import Home from "./pages/Home";

const Servers = lazy(() => import("./pages/Servers"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Network = lazy(() => import("./pages/Network"));
const About = lazy(() => import("./pages/About"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const TestimonialsPage = lazy(() => import("./pages/TestimonialsPage"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const Portal = lazy(() => import("./pages/Portal"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const INTRO_KEY = "beam-intro-seen";

const shouldShowIntro = () => {
  if (typeof window === "undefined" || prefersReducedMotion()) return false;
  if (window.location.pathname !== "/") return false;
  try {
    return sessionStorage.getItem(INTRO_KEY) !== "1";
  } catch {
    return false;
  }
};

const App = () => {
  const [intro, setIntro] = useState(shouldShowIntro);

  const finishIntro = useCallback(() => {
    setIntro(false);
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      return;
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="bottom-center" theme="dark" />
        <HoverReceiver />
        <AnimatePresence>{intro && <Preloader key="intro" onDone={finishIntro} />}</AnimatePresence>
        <IntroProvider ready={!intro}>
          <BrowserRouter>
            <Routes>
              <Route element={<SiteLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/servers" element={<Servers />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/network" element={<Network />} />
                <Route path="/about" element={<About />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/testimonials" element={<TestimonialsPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route
                path="/auth"
                element={
                  <Suspense fallback={<PageLoading />}>
                    <Auth />
                  </Suspense>
                }
              />
              <Route
                path="/portal"
                element={
                  <Suspense fallback={<PageLoading />}>
                    <Portal />
                  </Suspense>
                }
              />
              <Route
                path="/admin"
                element={
                  <Suspense fallback={<PageLoading />}>
                    <Admin />
                  </Suspense>
                }
              />
            </Routes>
          </BrowserRouter>
        </IntroProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
