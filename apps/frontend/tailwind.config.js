const { createGlobPatternsForDependencies } = require('@nx/next/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/*.{js,ts,jsx,tsx,mdx}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        // Map to CSS variables so light/dark theme tokens work with Tailwind utilities
        primary: {
          DEFAULT: 'var(--primary)',
          light:   'var(--primary-light)',
          dark:    'var(--primary-dark)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          2:       'var(--surface-2)',
        },
        bg:      'var(--bg)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger:  'var(--danger)',
        info:    'var(--info)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        sm:      'var(--shadow-sm)',
        md:      'var(--shadow-md)',
        lg:      'var(--shadow-lg)',
        primary: 'var(--shadow-primary)',
      },
      animation: {
        'slide-up': 'slide-up 0.4s ease forwards',
        'fade-in':  'fade-in 0.35s ease forwards',
        shimmer:    'shimmer 1.5s infinite linear',
      },
      keyframes: {
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition:  '1000px 0' },
        },
      },
    },
  },
  plugins: [],
};
