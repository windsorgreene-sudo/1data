import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useState } from "react";
import ScrollProgress from "./components/ScrollProgress";
import ScrollToTop from "./components/ScrollToTop";
import SmoothScroll from "./components/SmoothScroll";
import CursorGlow from "./components/CursorGlow";
import HoverReceiver from "@/visual-edits/VisualEditsMessenger";
import LoadingScreen from "./components/LoadingScreen";
import Home from "./pages/Home";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import ContactPage from "./pages/ContactPage";
import SupportPage from "./pages/SupportPage";
import TestimonialsPage from "./pages/TestimonialsPage";

const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const Portal = lazy(() => import("./pages/Portal"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="fixed inset-0 bg-[#07070f] z-[9999] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <img src="/beam-logo.svg" alt="Beam Server" className="w-14 h-14 animate-pulse drop-shadow-[0_0_18px_rgba(0,229,255,0.6)]" />
      <div className="w-40 h-[2px] rounded-full bg-[#1a1a2e] overflow-hidden">
        <div className="h-full w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-[shimmerMove_1.2s_linear_infinite]" />
      </div>
    </div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
      <Suspense fallback={<PageFallback />}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    );
};

const App = () => {
  const [loaded, setLoaded] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HoverReceiver />
        {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
        <BrowserRouter>
          <CursorGlow />
          <SmoothScroll />
          <ScrollProgress />
          <AnimatedRoutes />
          <ScrollToTop />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
