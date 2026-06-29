/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // ---- Dawn / New Horizon palette ----------------------------------
      colors: {
        // Bone / Alabaster surfaces. Never pure #fff.
        cream: {
          50:  'rgba(var(--c-cream-50), <alpha-value>)',
          100: 'rgba(var(--c-cream-100), <alpha-value>)',
          200: 'rgba(var(--c-cream-200), <alpha-value>)',
          300: 'rgba(var(--c-cream-300), <alpha-value>)',
          400: 'rgba(var(--c-cream-400), <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgba(var(--c-ink), <alpha-value>)',
          soft:    'rgba(var(--c-ink-soft), <alpha-value>)',
          muted:   'rgba(var(--c-ink-muted), <alpha-value>)',
        },
        primary: {
          50:  'rgba(var(--c-primary-50), <alpha-value>)',
          100: 'rgba(var(--c-primary-100), <alpha-value>)',
          200: 'rgba(var(--c-primary-200), <alpha-value>)',
          300: 'rgba(var(--c-primary-300), <alpha-value>)',
          400: 'rgba(var(--c-primary-400), <alpha-value>)',
          500: 'rgba(var(--c-primary-500), <alpha-value>)',
          600: 'rgba(var(--c-primary-600), <alpha-value>)',
          700: 'rgba(var(--c-primary-700), <alpha-value>)',
          800: 'rgba(var(--c-primary-800), <alpha-value>)',
        },
        accent: {
          50:  'rgba(var(--c-accent-50), <alpha-value>)',
          100: 'rgba(var(--c-accent-100), <alpha-value>)',
          200: 'rgba(var(--c-accent-200), <alpha-value>)',
          300: 'rgba(var(--c-accent-300), <alpha-value>)',
          400: 'rgba(var(--c-accent-400), <alpha-value>)',
          500: 'rgba(var(--c-accent-500), <alpha-value>)',
          600: 'rgba(var(--c-accent-600), <alpha-value>)',
        },
        sun: {
          300: 'rgba(var(--c-sun-300), <alpha-value>)',
          400: 'rgba(var(--c-sun-400), <alpha-value>)',
          500: 'rgba(var(--c-sun-500), <alpha-value>)',
        },
        'tone-sky':  { soft: 'rgba(var(--c-tone-sky-soft), <alpha-value>)', ink: 'rgba(var(--c-tone-sky-ink), <alpha-value>)', edge: 'rgba(var(--c-tone-sky-edge), <alpha-value>)' },
        'tone-mint': { soft: 'rgba(var(--c-tone-mint-soft), <alpha-value>)', ink: 'rgba(var(--c-tone-mint-ink), <alpha-value>)', edge: 'rgba(var(--c-tone-mint-edge), <alpha-value>)' },
        'tone-sun':  { soft: 'rgba(var(--c-tone-sun-soft), <alpha-value>)', ink: 'rgba(var(--c-tone-sun-ink), <alpha-value>)', edge: 'rgba(var(--c-tone-sun-edge), <alpha-value>)' },
        'tone-rose': { soft: 'rgba(var(--c-tone-rose-soft), <alpha-value>)', ink: 'rgba(var(--c-tone-rose-ink), <alpha-value>)', edge: 'rgba(var(--c-tone-rose-edge), <alpha-value>)' },
      },
      fontFamily: {
        display: ['MPlus', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['MPlus', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['MPlus Code', 'ui-monospace', 'monospace'],
        customLogo: ['Isego'],
      },
      // Soft, layered, warm-tinted shadows (warm umber base 67,42,20).
      boxShadow: {
        soft:           '0 1px 2px rgba(var(--c-shadow), 0.04), 0 4px 12px rgba(var(--c-shadow), 0.05)',
        card:           '0 2px 4px rgba(var(--c-shadow), 0.05), 0 14px 32px -10px rgba(var(--c-shadow), 0.10)',
        lift:           '0 12px 24px -8px rgba(var(--c-shadow), 0.12), 0 28px 56px -18px rgba(var(--c-shadow), 0.16)',
        glow:           '0 10px 26px -8px rgba(var(--c-primary-500), 0.40)',
        'glow-primary': '0 10px 26px -8px rgba(var(--c-primary-600), 0.36)',
        'inner-soft':   'inset 0 1px 2px rgba(var(--c-shadow), 0.05)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backgroundImage: {
        // Soft, clean ambient vignette: faint cobalt haze settling over bone.
        dawn:
          'radial-gradient(120% 80% at 50% -10%, rgba(var(--c-body-glow-1), var(--c-body-glow-alpha-1)), transparent 60%), radial-gradient(100% 60% at 88% 0%, rgba(var(--c-body-glow-2), var(--c-body-glow-alpha-2)), transparent 55%), linear-gradient(180deg, rgba(var(--c-body-bg-1), 1) 0%, rgba(var(--c-body-bg-2), 1) 45%, rgba(var(--c-body-bg-3), 1) 100%)',
        'primary-sheen': 'linear-gradient(135deg, rgba(var(--c-primary-500), 1) 0%, rgba(var(--c-primary-600), 1) 100%)',
        'accent-sheen':  'linear-gradient(135deg, rgba(var(--c-accent-400), 1) 0%, rgba(var(--c-accent-500), 1) 100%)',
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
          '0%, 100%': { boxShadow: '0 10px 26px -8px rgba(var(--c-primary-500), 0.32)' },
          '50%':      { boxShadow: '0 14px 34px -8px rgba(var(--c-primary-500), 0.52)' },
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
