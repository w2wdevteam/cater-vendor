import animate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#FFF7ED',
          100: '#FFEDD5',
          600: '#EA580C',
          700: '#C2410C',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        blue: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        status: {
          'active-bg': '#DCFCE7',
          'active-text': '#166534',
          'approved-bg': '#DCFCE7',
          'approved-text': '#166534',
          'new-bg': '#DBEAFE',
          'new-text': '#1E40AF',
          'pending-bg': '#FEF9C3',
          'pending-text': '#854D0E',
          'rejected-bg': '#FEE2E2',
          'rejected-text': '#991B1B',
          'not-delivered-bg': '#F3F4F6',
          'not-delivered-text': '#374151',
          'inactive-bg': '#F3F4F6',
          'inactive-text': '#6B7280',
          'sold-out-bg': '#FEE2E2',
          'sold-out-text': '#991B1B',
        },
        dietary: {
          'vegetarian-bg': '#DCFCE7',
          'vegetarian-text': '#166534',
          'vegan-bg': '#D1FAE5',
          'vegan-text': '#065F46',
          'halal-bg': '#DBEAFE',
          'halal-text': '#1E40AF',
          'gluten-free-bg': '#FEF9C3',
          'gluten-free-text': '#854D0E',
          'nuts-bg': '#FEE2E2',
          'nuts-text': '#991B1B',
          'dairy-bg': '#FFEDD5',
          'dairy-text': '#C2410C',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-slow': 'pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [animate],
}
