import type { Config } from 'tailwindcss'

export default {
  content: [
  './pages/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
  './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4C6FFF',
        muted: {
          50: '#F2F6FF',
          100: '#EFF4F9',
          500: '#6B7280',
          700: '#1F2937'
        }
      },
      boxShadow: {
        soft: '0 4px 12px rgba(0, 0, 0, 0.04)'
      },
      borderRadius: {
        xl: '16px'
      }
    },
  },
  plugins: [],
} satisfies Config
