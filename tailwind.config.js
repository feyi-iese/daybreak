/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ---- Dawn / New Horizon palette ----------------------------------
      colors: {
        // Warm neutral surfaces (cream / warm-white). Never pure #fff.
        cream: {
          50: '#FFFCF8',
          100: '#FCF6EE',
          200: '#F6EADA',
          300: '#EBDBC6',
          400: '#D9C3A6',
        },
        // Warm near-black ink for text. Never pure #000.
        ink: {
          DEFAULT: '#2C2722',
          soft: '#6A6157',
          muted: '#9C9186',
        },
        // Confident teal/emerald — growth, vitality, "go".
        primary: {
          50: '#E8F8F3',
          100: '#C7EEE4',
          200: '#97DECD',
          300: '#5FC9B3',
          400: '#2BB29A',
          500: '#129B86',
          600: '#0C8071',
          700: '#0A655A',
          800: '#094E46',
        },
        // Warm coral — joyful CTAs and glow.
        accent: {
          50: '#FFF1EB',
          100: '#FFDCCF',
          200: '#FFBCA1',
          300: '#FF9874',
          400: '#FF7A53',
          500: '#F65F3B',
          600: '#DC4A29',
        },
        // Warm amber sun — secondary accent / highlights.
        sun: {
          300: '#FBC56A',
          400: '#F6A93B',
          500: '#E8901C',
        },
        // Dignified, muted category tones (never alarm-red).
        'tone-sky': { soft: '#E8F1F8', ink: '#2F6C8F', edge: '#CFE1EE' },
        'tone-mint': { soft: '#E3F4EF', ink: '#0C8071', edge: '#C6E8DF' },
        'tone-sun': { soft: '#FAF0DA', ink: '#946410', edge: '#F0E0BB' },
        'tone-rose': { soft: '#FBEAE4', ink: '#B0584C', edge: '#F2D4CC' },
      },
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      // Soft, layered, warm-tinted shadows (warm umber base 67,42,20).
      boxShadow: {
        soft: '0 1px 2px rgba(67,42,20,0.04), 0 4px 12px rgba(67,42,20,0.05)',
        card: '0 2px 4px rgba(67,42,20,0.05), 0 14px 32px -10px rgba(67,42,20,0.12)',
        lift: '0 12px 24px -8px rgba(67,42,20,0.14), 0 28px 56px -18px rgba(67,42,20,0.18)',
        glow: '0 10px 26px -8px rgba(255,122,83,0.50)',
        'glow-primary': '0 10px 26px -8px rgba(18,155,134,0.42)',
        'inner-soft': 'inset 0 1px 2px rgba(67,42,20,0.05)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backgroundImage: {
        // Subtle sunrise wash for the page (also applied to body in base).
        dawn:
          'radial-gradient(120% 80% at 50% -10%, rgba(255,196,150,0.35), transparent 60%), radial-gradient(100% 60% at 88% 0%, rgba(255,138,99,0.12), transparent 55%), linear-gradient(180deg, #FFF7EE 0%, #FDF4EA 42%, #FBF1E6 100%)',
        'primary-sheen': 'linear-gradient(135deg, #16A892 0%, #0C7C6D 100%)',
        'accent-sheen': 'linear-gradient(135deg, #FF8A63 0%, #F65F3B 100%)',
      },
      keyframes: {
        'fade-rise': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-150% 0' },
          '100%': { backgroundPosition: '150% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 10px 26px -8px rgba(255,122,83,0.35)' },
          '50%': { boxShadow: '0 14px 34px -8px rgba(255,122,83,0.55)' },
        },
      },
      animation: {
        // Gentle exponential ease-out (easeOutQuint), no bounce.
        'fade-rise': 'fade-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        float: 'float 7s ease-in-out infinite',
        shimmer: 'shimmer 2.8s linear infinite',
        'glow-pulse': 'glow-pulse 3.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
