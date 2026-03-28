/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#0F172A',
        ocean: '#0B3A75',
        auric: '#D4A72C',
        mist: '#DDE7F4'
      },
      boxShadow: {
        glass: '0 10px 30px rgba(4, 12, 24, 0.22)'
      },
      animation: {
        float: 'float 7s ease-in-out infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    }
  },
  plugins: []
};
