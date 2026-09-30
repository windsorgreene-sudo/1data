import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      xs: "375px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        sans: ["Instrument Sans", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Space Grotesk", "Instrument Sans", "ui-sans-serif", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "hsl(var(--ink) / <alpha-value>)",
          2: "hsl(var(--ink-2) / <alpha-value>)",
          3: "hsl(var(--ink-3) / <alpha-value>)",
          4: "hsl(var(--ink-4) / <alpha-value>)",
        },
        bone: {
          DEFAULT: "hsl(var(--bone) / <alpha-value>)",
          dim: "hsl(var(--bone-dim) / <alpha-value>)",
        },
        mute: "hsl(var(--mute) / <alpha-value>)",
        beam: {
          DEFAULT: "hsl(var(--beam) / <alpha-value>)",
          deep: "hsl(var(--beam-deep) / <alpha-value>)",
        },
        ember: "hsl(var(--ember) / <alpha-value>)",
        nebula: "hsl(var(--nebula) / <alpha-value>)",
        signal: "hsl(var(--signal) / <alpha-value>)",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-secondary": "var(--gradient-secondary)",
        "gradient-hero": "var(--gradient-hero)",
        "gradient-card": "var(--gradient-card)",
        "gradient-surface": "var(--gradient-surface)",
        "gradient-accent": "var(--gradient-accent)",
        "gradient-beam": "var(--gradient-beam)",
        "text-gradient": "var(--text-gradient)",
        "text-gradient-secondary": "var(--text-gradient-secondary)",
      },
      boxShadow: {
        glow: "var(--glow-primary)",
        "glow-secondary": "var(--glow-secondary)",
        "glow-accent": "var(--glow-accent)",
        "glow-beam": "var(--glow-beam)",
        elegant: "var(--shadow-elegant)",
        premium: "var(--shadow-premium)",
        luxury: "var(--shadow-luxury)",
        "glow-shadow": "var(--shadow-glow)",
        soft: "var(--shadow-soft)",
        beam: "var(--shadow-beam)",
        lift: "0 1px 0 0 hsl(0 0% 100% / 0.06) inset, 0 24px 60px -24px hsl(0 0% 0% / 0.8)",
      },
      backgroundColor: {
        glass: "var(--glass-bg)",
      },
      borderColor: {
        glass: "var(--glass-border)",
        "glass-hover": "var(--glass-border-hover)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-out-quart": "cubic-bezier(0.76, 0, 0.24, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        marquee: {
          from: { transform: "translate3d(0, 0, 0)" },
          to: { transform: "translate3d(-50%, 0, 0)" },
        },
        "marquee-y": {
          from: { transform: "translate3d(0, 0, 0)" },
          to: { transform: "translate3d(0, -50%, 0)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.6)", opacity: "0.9" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "accordion-up": "accordion-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        marquee: "marquee var(--marquee-duration, 40s) linear infinite",
        "marquee-y": "marquee-y var(--marquee-duration, 40s) linear infinite",
        "fade-in": "fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        float: "float 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite",
        blink: "blink 1.1s steps(1) infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "spin-slow": "spin-slow 24s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
