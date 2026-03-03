import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'lenis/dist/lenis.css'

if (typeof window !== "undefined") {
  const parentOrigin = (() => {
    try {
      const ref = document.referrer;
      if (ref) return new URL(ref).origin;
    } catch { /* fall through */ }
    return "*";
  })();
  const sendToParent = (data: unknown) => {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(data, parentOrigin);
      }
    } catch (error) {
      // Ignore postMessage errors
    }
  };

  window.addEventListener("error", (event) => {
    // Send structured payload to parent iframe
    sendToParent({
      type: "ERROR_CAPTURED",
      error: {
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        source: "window.onerror",
      },
      timestamp: Date.now(),
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason as Error | null | undefined;
    const message =
      reason && typeof reason === "object" && 'message' in reason
        ? String(reason.message)
        : String(reason);
    const stack = reason && typeof reason === "object" && 'stack' in reason ? reason.stack : undefined;

    // Mirror to parent iframe as well
    sendToParent({
      type: "ERROR_CAPTURED",
      error: {
        message,
        stack,
        filename: undefined,
        lineno: undefined,
        colno: undefined,
        source: "unhandledrejection",
      },
      timestamp: Date.now(),
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);