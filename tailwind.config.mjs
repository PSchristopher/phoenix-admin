// import CONFIG from './config';

/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    preflight: false,
  },
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0eeff',
          200: '#b8ddff',
          300: '#7cc3ff',
          400: '#3aa3ff',
          500: '#0077e6',
          600: '#005db4',
          700: '#00488D',
          800: '#003c73',
          900: '#003566',
          950: '#001a33',
          DEFAULT: '#00488D',
        },
        rfprimary: '#00488D',
      },
    },
  },
  plugins: [],
};
