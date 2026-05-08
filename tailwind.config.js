/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Outfit"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f6f5f1',
          100: '#e8e6dc',
          200: '#cfcab8',
          300: '#a59e85',
          400: '#7a7259',
          500: '#534d3d',
          600: '#3a352a',
          700: '#2a2620',
          800: '#1c1a16',
          900: '#0e0d0b',
        },
        accent: {
          DEFAULT: '#d97706',
          light: '#fbbf24',
          dark: '#92400e',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        card: '0 1px 0 rgba(0,0,0,0.04), 0 12px 40px -12px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};
