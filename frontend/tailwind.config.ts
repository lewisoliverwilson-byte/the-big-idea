import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        barlow: ['"Barlow Condensed"', '"Arial Narrow"', 'sans-serif'],
        dm:     ['"DM Mono"', 'monospace'],
        outfit: ['Outfit', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.15', transform: 'scale(0.7)' },
          '50%':      { opacity: '0.9',  transform: 'scale(1.3)' },
        },
        'float-orb': {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)  scale(1)' },
          '33%':      { transform: 'translateY(-24px) translateX(14px)  scale(1.04)' },
          '66%':      { transform: 'translateY(10px) translateX(-16px) scale(0.97)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.45', transform: 'scale(1)' },
          '50%':      { opacity: '0.85', transform: 'scale(1.06)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        fadeIn:       'fadeIn 0.22s ease-out forwards',
        twinkle:      'twinkle 3s ease-in-out infinite',
        'float-orb':  'float-orb 14s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        shimmer:      'shimmer 4s linear infinite',
        'spin-slow':  'spin-slow 20s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
