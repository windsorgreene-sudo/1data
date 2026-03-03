import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { componentTaggerPlugin } from "./src/visual-edits/component-tagger-plugin.js";

// Minimal plugin to log build-time and dev-time errors to console
const logErrorsPlugin = () => ({
  name: "log-errors-plugin",
  // Inject a small client-side script that mirrors Vite overlay errors to console
  transformIndexHtml() {
    return {
      tags: [
        {
          tag: "script",
          injectTo: "head",
          children: `(() => {
            try {
              const _parentOrigin = (() => {
                try {
                  const ref = document.referrer;
                  if (ref) return new URL(ref).origin;
                } catch (_) {}
                return '*';
              })();
              const logOverlay = () => {
                const el = document.querySelector('vite-error-overlay');
                if (!el) return;
                const root = (el.shadowRoot || el);
                let text = '';
                try { text = root.textContent || ''; } catch (_) {}
                if (text && text.trim()) {
                  const msg = text.trim();
                  // Use console.error to surface clearly in DevTools
                  console.error('[Vite Overlay]', msg);
                  // Also mirror to parent iframe with structured payload
                  try {
                    if (window.parent && window.parent !== window) {
                      window.parent.postMessage({
                        type: 'ERROR_CAPTURED',
                        error: {
                          message: msg,
                          stack: undefined,
                          filename: undefined,
                          lineno: undefined,
                          colno: undefined,
                          source: 'vite.overlay',
                        },
                        timestamp: Date.now(),
                      }, _parentOrigin);
                    }
                  } catch (_) {}
                }
              };

              const obs = new MutationObserver(() => logOverlay());
              obs.observe(document.documentElement, { childList: true, subtree: true });

              window.addEventListener('DOMContentLoaded', logOverlay);
              // Attempt immediately as overlay may already exist
              logOverlay();
            } catch (e) {
              console.warn('[Vite Overlay logger failed]', e);
            }
          })();`
        }
      ]
    };
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
  },
  plugins: [
    react(),
    logErrorsPlugin(),
    mode === 'development' && componentTaggerPlugin(),
  ].filter(Boolean),
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssMinify: true,
      cssCodeSplit: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('node_modules/three/') || id.includes('node_modules/@react-three/')) return 'vendor-three';
            if (id.includes('node_modules/clsx/') || id.includes('node_modules/tailwind-merge/') || id.includes('node_modules/class-variance-authority/')) return 'vendor-utils';
            if (id.includes('node_modules/framer-motion/') || id.includes('node_modules/@radix-ui/') || id.includes('node_modules/lucide-react/')) return 'vendor-ui';
            if (id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router') || id.includes('node_modules/react/')) return 'vendor-react';
          },
        },
      },
      chunkSizeWarningLimit: 1200,
    },
    resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
// Orchids restart: 1768586839806