/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f4',
          100: '#d8f0e4',
          200: '#b3e0c8',
          300: '#84cba9',
          400: '#51b386',
          500: '#2E8B57', // Emerald Green
          600: '#207346',
          700: '#185c39',
          800: '#144a2e',
          900: '#103c26',
          950: '#07231a',
        },
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#1C2541', // Royal Navy
          600: '#0f142b',
          700: '#0c1121',
          800: '#080c17',
          900: '#040610',
          950: '#020308',
        },
        accent: {
          50: '#fbf8ed',
          100: '#f8f1d4',
          200: '#f0e4aa',
          300: '#e9d57e',
          400: '#e1c54e',
          500: '#D4AF37', // Champagne Gold
          600: '#c39e2d',
          700: '#a17e24',
          800: '#816524',
          900: '#6a5223',
          950: '#3a2c13',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        warmAlabaster: '#F4F1EB',
        champagneGold: '#D4AF37',
        ivoryWhite: '#F8F6F0',
        mutedMauve: '#8D7B8E',
        pewterGray: '#A0A0A0',
        emeraldGreen: '#2E8B57',
        royalNavy: '#1C2541',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'elegant': '0 0 15px rgba(0, 0, 0, 0.05), 0 0 2px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.03)',
        'elegant-xl': '0 0 25px rgba(0, 0, 0, 0.05), 0 0 10px rgba(0, 0, 0, 0.1), 0 2px 5px rgba(0, 0, 0, 0.03)',
        'luxe': '0 4px 20px rgba(212, 175, 55, 0.1), 0 2px 5px rgba(212, 175, 55, 0.05)',
        'luxe-hover': '0 10px 25px rgba(212, 175, 55, 0.15), 0 5px 10px rgba(212, 175, 55, 0.1)',
      },
      backgroundImage: {
        'luxe-gradient': 'linear-gradient(to right, #F8F6F0, #F4F1EB)',
        'luxe-gradient-dark': 'linear-gradient(to right, #1C2541, #193054)',
      },
      zIndex: {
        '45': '45',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 