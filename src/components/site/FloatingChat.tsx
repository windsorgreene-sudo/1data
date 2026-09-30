import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { EASE_OUT } from "@/lib/motion";
import { GENERAL_MESSAGE, whatsappLink } from "@/lib/site";

export const FloatingChat = () => {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const nearBottom = window.innerHeight + y > document.documentElement.scrollHeight - 520;
    setShow(y > 700 && !nearBottom);
  });

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          key="chat"
          href={whatsappLink(GENERAL_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Beam on WhatsApp"
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.9 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="group fixed bottom-5 right-5 z-40 inline-flex h-12 items-center gap-2.5 rounded-full border border-white/10 bg-ink-2/85 pl-2 pr-5 text-sm text-bone shadow-lift backdrop-blur-xl transition-colors hover:border-beam/40 sm:bottom-7 sm:right-7"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-beam text-ink">
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-beam/50" />
            <MessageCircle className="relative h-4 w-4" strokeWidth={2.2} />
          </span>
          Chat with us
        </motion.a>
      )}
    </AnimatePresence>
  );
};

export default FloatingChat;
