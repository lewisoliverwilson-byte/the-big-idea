import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        barlow:  ['"Barlow Condensed"', '"Arial Narrow"', 'sans-serif'],
        dm:      ['"DM Mono"', 'monospace'],
        outfit:  ['Outfit', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.22s ease-out forwards',
      },
    },
  },
  plugins: [],
}

export default config
