import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

// Add shimmer animation for skeletons

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '375px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
		},
		extend: {
			fontFamily: {
				sans: ["Instrument Sans", "Inter", "sans-serif"],
				display: ["Space Grotesk", "sans-serif"],
			},
		backgroundImage: {
			'gradient-primary': 'var(--gradient-primary)',
			'gradient-secondary': 'var(--gradient-secondary)',
			'gradient-hero': 'var(--gradient-hero)',
			'gradient-card': 'var(--gradient-card)',
			'gradient-surface': 'var(--gradient-surface)',
			'gradient-accent': 'var(--gradient-accent)',
			'gradient-beam': 'var(--gradient-beam)',
			'text-gradient': 'var(--text-gradient)',
			'text-gradient-secondary': 'var(--text-gradient-secondary)',
		},
		boxShadow: {
			'glow': 'var(--glow-primary)',
			'glow-secondary': 'var(--glow-secondary)',
			'glow-accent': 'var(--glow-accent)',
			'glow-beam': 'var(--glow-beam)',
			'elegant': 'var(--shadow-elegant)',
			'premium': 'var(--shadow-premium)',
			'luxury': 'var(--shadow-luxury)',
			'glow-shadow': 'var(--shadow-glow)',
			'soft': 'var(--shadow-soft)',
			'beam': 'var(--shadow-beam)',
		},
		backgroundColor: {
			'glass': 'var(--glass-bg)',
		},
		borderColor: {
			'glass': 'var(--glass-border)',
			'glass-hover': 'var(--glass-border-hover)',
		},
		animation: {
			'accordion-down': 'accordion-down 0.2s ease-out',
			'accordion-up': 'accordion-up 0.2s ease-out',
			'fade-in': 'fadeIn 0.8s ease-out',
			'fade-in-up': 'fadeInUp 0.8s ease-out',
			'slide-up': 'slideUp 1s ease-out',
			'slide-in-left': 'slideInLeft 0.8s ease-out',
			'slide-in-right': 'slideInRight 0.8s ease-out',
			'bounce-in': 'bounceIn 0.8s ease-out',
			'scale-in': 'scaleIn 0.6s ease-out',
			'float': 'float 4s ease-in-out infinite',
			'float-delayed': 'floatDelayed 4s ease-in-out infinite',
			'glow-pulse': 'glowPulse 3s ease-in-out infinite alternate',
			'glow-rotate': 'glowRotate 4s linear infinite',
			'shimmer': 'shimmer 2.5s ease-in-out infinite',
			'gradient-shift': 'gradientShift 3s ease-in-out infinite',
			'breathe': 'breathe 2s ease-in-out infinite',
			'dash': 'dash 20s linear infinite',
			'beam-flow': 'beamFlow 3s linear infinite',
			'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
			'spin-slow': 'spinSlow 20s linear infinite',
		},
		keyframes: {
			fadeIn: {
				'0%': { opacity: '0', transform: 'translateY(30px)' },
				'100%': { opacity: '1', transform: 'translateY(0)' },
			},
			fadeInUp: {
				'0%': { opacity: '0', transform: 'translateY(60px)' },
				'100%': { opacity: '1', transform: 'translateY(0)' },
			},
			slideUp: {
				'0%': { opacity: '0', transform: 'translateY(50px)' },
				'100%': { opacity: '1', transform: 'translateY(0)' },
			},
			slideInLeft: {
				'0%': { opacity: '0', transform: 'translateX(-50px)' },
				'100%': { opacity: '1', transform: 'translateX(0)' },
			},
			slideInRight: {
				'0%': { opacity: '0', transform: 'translateX(50px)' },
				'100%': { opacity: '1', transform: 'translateX(0)' },
			},
			bounceIn: {
				'0%': { opacity: '0', transform: 'scale(0.3) translateY(20px)' },
				'50%': { opacity: '1', transform: 'scale(1.1) translateY(-5px)' },
				'70%': { transform: 'scale(0.95) translateY(2px)' },
				'100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
			},
			scaleIn: {
				'0%': { opacity: '0', transform: 'scale(0.8)' },
				'100%': { opacity: '1', transform: 'scale(1)' },
			},
			float: {
				'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
				'50%': { transform: 'translateY(-12px) rotate(2deg)' },
			},
			floatDelayed: {
				'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
				'50%': { transform: 'translateY(-15px) rotate(-2deg)' },
			},
			dash: {
				'0%': { strokeDashoffset: '0' },
				'100%': { strokeDashoffset: '100' },
			},
			glowPulse: {
				'0%': { boxShadow: 'var(--glow-primary)', transform: 'scale(1)' },
				'50%': { boxShadow: 'var(--glow-secondary)', transform: 'scale(1.02)' },
				'100%': { boxShadow: 'var(--glow-primary)', transform: 'scale(1)' },
			},
			glowRotate: {
				'0%': { filter: 'hue-rotate(0deg)' },
				'100%': { filter: 'hue-rotate(360deg)' },
			},
			shimmer: {
				'0%': { backgroundPosition: '-200% 0' },
				'100%': { backgroundPosition: '200% 0' },
			},
			gradientShift: {
				'0%, 100%': { backgroundPosition: '0% 50%' },
				'50%': { backgroundPosition: '100% 50%' },
			},
			breathe: {
				'0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
				'50%': { transform: 'scale(1.05)', opacity: '1' },
			},
			beamFlow: {
				'0%': { transform: 'translateX(-100%)' },
				'100%': { transform: 'translateX(100%)' },
			},
			pulseSlow: {
				'0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
				'50%': { opacity: '1', transform: 'scale(1.1)' },
			},
			spinSlow: {
				'0%': { transform: 'rotate(0deg)' },
				'100%': { transform: 'rotate(360deg)' },
			},
		},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
