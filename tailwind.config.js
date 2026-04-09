/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        // Custom breakpoints for better mobile/tablet control
        'xs': '375px',    // Small phones (iPhone SE)
        'sm': '480px',    // Large phones
        'md': '768px',    // Tablets
        'lg': '1024px',   // Small laptops/landscape tablets
        'xl': '1280px',   // Desktops
        '2xl': '1536px',  // Large desktops
        '3xl': '1920px',  // Extra large screens
      },
      colors: {
        primary: {
          gold: '#D4AF37',
          rose: '#E0BFB8',
        },
        dark: {
          DEFAULT: '#0A0A0A',
          100: '#050505',
          200: '#111111',
          300: '#1A1A1A',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      fontSize: {
        // Responsive font sizes
        'xs-mobile': ['0.7rem', { lineHeight: '1rem' }],
        'sm-mobile': ['0.8rem', { lineHeight: '1.25rem' }],
        'base-mobile': ['0.9rem', { lineHeight: '1.5rem' }],
        'lg-mobile': ['1.1rem', { lineHeight: '1.75rem' }],
        'xl-mobile': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl-mobile': ['1.5rem', { lineHeight: '2rem' }],
        '3xl-mobile': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl-mobile': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        // Safe area insets for notched phones
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'glow': 'glow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { textShadow: '0 0 20px rgba(212,175,55,0.3)' },
          '50%': { textShadow: '0 0 40px rgba(212,175,55,0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}