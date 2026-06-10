import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
			"./1776967513477506338.html"
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
		extend: {
			colors: {
				/* ── Бренд-алиасы — пиши bg-brand, text-brand и т.д. ── */
				brand: {
					DEFAULT: 'var(--brand)',
					hover:   'var(--brand-hover)',
					light:   'var(--brand-light)',
					border:  'var(--brand-border)',
					muted:   'var(--brand-muted)',
					subtle:  'var(--brand-subtle)',
				},
				/* ── Семантика ── */
				success: {
					DEFAULT: 'var(--c-success)',
					light:   'var(--c-success-light)',
					border:  'var(--c-success-border)',
				},
				danger: {
					DEFAULT: 'var(--c-danger)',
					light:   'var(--c-danger-light)',
				},
				warning: {
					DEFAULT: 'var(--c-warning)',
					light:   'var(--c-warning-light)',
				},
				/* ── UI-нейтралы ── */
				ui: {
					text:        'var(--c-text)',
					muted:       'var(--c-text-muted)',
					faint:       'var(--c-text-faint)',
					soft:        'var(--c-text-soft)',
					border:      'var(--c-border)',
					'border-soft': 'var(--c-border-soft)',
					bg:          'var(--c-bg)',
					'bg-soft':   'var(--c-bg-soft)',
					'bg-page':   'var(--c-bg-page)',
					'bg-input':  'var(--c-bg-input)',
				},
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
			fontFamily: {
				golos: ['"Golos Text"', 'sans-serif'],
			},
			keyframes: {
				'slide-in-right': {
					from: { transform: 'translateX(100%)', opacity: '0' },
					to: { transform: 'translateX(0)', opacity: '1' },
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
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
				'accordion-up': 'accordion-up 0.2s ease-out',
				'slide-in-right': 'slide-in-right 0.2s ease-out',
				'fade-in': 'fade-in 0.2s ease-out',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;