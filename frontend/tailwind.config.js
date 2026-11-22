/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Strict LiveBridge AI Palette
        alabaster: '#FAF8F5',       // Main Background
        ivory: '#FFFFFF',           // Card & Surface
        brand: {
          teal: '#0F6E73',          // Primary Brand - Calming Deep Teal
          'teal-hover': '#0C585C',
          'teal-light': '#14888F',
          'teal-soft': '#E6F3F3',
          'teal-dark': '#094B4E',
        },
        eucalyptus: {
          DEFAULT: '#E3F1EC',       // Secondary / Calm - Soft Eucalyptus
          light: '#F0F8F5',
          dark: '#135843',
          border: '#C1E2D6',
        },
        charcoal: '#1E293B',        // Body Text - Deep Charcoal (13:1 contrast)
        slate: {
          warm: '#5A6577',          // Muted Text - Warm Slate
          light: '#727E93',
          border: '#E2E8F0',
        },
        terracotta: {
          DEFAULT: '#C85A32',       // Alert / Mismatch - Muted Terracotta
          light: '#FCF3EE',
          dark: '#9F3E1D',
          border: '#F2C9B9',
        },
        amber: {
          warning: '#D9822B',       // Warning / Missing - Warm Amber
          light: '#FEF7EC',
          dark: '#AC631B',
          border: '#F6D5A8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'elderly-base': ['1.125rem', { lineHeight: '1.75rem' }],
        'elderly-lg': ['1.25rem', { lineHeight: '1.875rem' }],
        'elderly-xl': ['1.5rem', { lineHeight: '2rem' }],
        'elderly-2xl': ['1.875rem', { lineHeight: '2.25rem' }],
        'elderly-3xl': ['2.25rem', { lineHeight: '2.75rem' }],
      },
      boxShadow: {
        'soft': '0 2px 14px 0 rgba(15, 110, 115, 0.06)',
        'card': '0 4px 20px 0 rgba(30, 41, 59, 0.06)',
        'card-hover': '0 10px 28px 0 rgba(15, 110, 115, 0.12)',
        'teal-glow': '0 0 0 3px rgba(15, 110, 115, 0.25)',
      },
      borderRadius: {
        'xl2': '1.25rem',
        '2xl2': '1.75rem',
      },
    },
  },
  plugins: [],
}
