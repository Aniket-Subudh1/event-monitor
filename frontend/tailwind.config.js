/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#EEF2FF',
            100: '#E0E7FF',
            200: '#C7D2FE',
            300: '#A5B4FC',
            400: '#818CF8',
            500: '#6366F1',
            600: '#4F46E5',
            700: '#4338CA',
            800: '#3730A3',
            900: '#312E81',
          },
          secondary: {
            50: '#ECFDF5',
            100: '#D1FAE5',
            200: '#A7F3D0',
            300: '#6EE7B7',
            400: '#34D399',
            500: '#10B981',
            600: '#059669',
            700: '#047857',
            800: '#065F46',
            900: '#064E3B',
          },
        },
        fontFamily: {
          sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        },
        spacing: {
          '72': '18rem',
          '84': '21rem',
          '96': '24rem',
        },
        animation: {
          'spin-slow': 'spin 3s linear infinite',
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
        screens: {
          '3xl': '1920px',
        },
        borderRadius: {
          '4xl': '2rem',
        },
        width: {
          '1/7': '14.2857143%',
          '2/7': '28.5714286%',
          '3/7': '42.8571429%',
          '4/7': '57.1428571%',
          '5/7': '71.4285714%',
          '6/7': '85.7142857%',
        },
        height: {
          '1/2vh': '50vh',
          '3/4vh': '75vh',
          '1/3vh': '33.33vh',
          '2/3vh': '66.66vh',
          'screen-90': '90vh',
        },
        maxHeight: {
          '0': '0',
          'screen-90': '90vh',
        },
        minHeight: {
          '0': '0',
          'screen-50': '50vh',
          'screen-75': '75vh',
        },
        zIndex: {
          '60': '60',
          '70': '70',
          '80': '80',
          '90': '90',
          '100': '100',
        },
        boxShadow: {
          'inner-lg': 'inset 0 2px 8px 0 rgba(0, 0, 0, 0.1)',
        },
        transitionDuration: {
          '400': '400ms',
          '2000': '2000ms',
        },
      },
    },
    plugins: [],
  }