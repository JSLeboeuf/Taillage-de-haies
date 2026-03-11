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
        'haie-green': {
          50: '#f0f9f4',
          100: '#daf2e4',
          200: '#b7e4cb',
          300: '#86d0ab',
          400: '#54b385',
          500: '#339768',
          600: '#237a52',
          700: '#1a4d2e', // primary
          800: '#163e24',
          900: '#12331e',
        },
        'haie-cream': {
          50: '#faf8f4', // primary background
          100: '#f5f2ea',
          200: '#ebe5d5',
          300: '#dfd5bb',
          400: '#d1c19f',
          500: '#c9a84c', // accent gold
        },
        dark: {
          bg: '#0f1117',
          card: '#1a1d27',
          border: '#2a2d37',
          hover: '#21242e',
        },
        accent: {
          green: '#22c55e',
          red: '#ef4444',
          blue: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
