import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // California Design System
        california: {
          sand: '#F9FAF7',      // Background - warm off-white
          white: '#FFFFFF',     // Surface cards
          border: '#E6E2D8',    // Soft sand borders
          pacific: '#1E6FFF',   // Ocean blue
          poppy: '#F6B400',     // Golden poppy (state flower)
          redwood: '#2E5E4E',   // Forest green
          sunset: '#FF7A18',    // Orange accent
        },
        // Fraud Severity Heatmap Colors
        fraud: {
          low: '#FFF3C4',       // Light yellow
          medium: '#F6B400',    // Golden
          high: '#FF7A18',      // Orange
          critical: '#D72638',  // Crimson (never black)
        },
        // Text colors
        text: {
          primary: '#1A1A1A',   // Near-black for readability
          secondary: '#5C5C5C', // Muted gray
          tertiary: '#8A8A8A',  // Light gray
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-md': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'kpi': ['2.75rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '600' }],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 4px 12px 0 rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'panel': '0 4px 20px 0 rgba(0, 0, 0, 0.08)',
        'modal': '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
        'glow-gold': '0 0 20px rgba(246, 180, 0, 0.3)',
      },
      backdropBlur: {
        'glass': '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'count-up': 'countUp 1s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(246, 180, 0, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(246, 180, 0, 0.4)' },
        },
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
        'chip': '20px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config
