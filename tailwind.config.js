/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ---- Dawn / New Horizon palette ----------------------------------
      colors: {
        // Bone / Alabaster surfaces. Never pure #fff.
        cream: {
          50:  '#FDFDFC', // lightest bone, card faces and rims
          100: '#FBFBF9', // base bone white, app background top
          200: '#F7F5F0', // alabaster, quiet surfaces and tracks
          300: '#EDEAE2', // sand edge, borders and hairlines
          400: '#DAD5C9', // deep oat, strong dividers and disabled fills
        },
        // Graphite / Charcoal text. Never pure #000.
        ink: {
          DEFAULT: '#1C1B1A', // graphite, primary text
          soft:    '#514E4A', // mid graphite, secondary text
          muted:   '#8A8780', // stone, tertiary text and axis labels
        },
        // Royal Cobalt Blue
        primary: {
          50:  '#EDF0FB', // faint cobalt haze, tinted fills
          100: '#D4DCF7', // chip backgrounds
          200: '#A6B6EE', // soft cobalt, rings and band fills
          300: '#6E86E2', // mid cobalt, hover borders, chart edges
          400: '#2F55D4', // strong cobalt, focus borders
          500: '#0038FF', // electric cobalt, active states, glow, gauge bead
          600: '#002FA7', // royal cobalt (Klein), default brand, buttons
          700: '#00257E', // deep cobalt, pressed and emphasis text
          800: '#001A57', // ink-cobalt, deepest accents
        },
        // Botanical Sage (muted secondary, "the goal / wellness")
        accent: {
          50:  '#EFF4F1',
          100: '#D8E5DE',
          200: '#B3CDBF',
          300: '#84AC97',
          400: '#5C8B74',
          500: '#467259',
          600: '#355A45',
        },
        // Apothecary Brass (muted tertiary, retained key name)
        sun: {
          300: '#D9C18A',
          400: '#C2A65F',
          500: '#A8893F',
        },
        // Dignified BMI category tones (recolored to cool/apothecary)
        'tone-sky':  { soft: '#EDF0FB', ink: '#002FA7', edge: '#D4DCF7' },
        'tone-mint': { soft: '#EFF4F1', ink: '#355A45', edge: '#D8E5DE' },
        'tone-sun':  { soft: '#F6EFDD', ink: '#7A6321', edge: '#EBDFC2' },
        'tone-rose': { soft: '#F4ECEC', ink: '#8A5350', edge: '#E7D7D5' },
      },
      fontFamily: {
        display: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      // Soft, layered, warm-tinted shadows (warm umber base 67,42,20).
      boxShadow: {
        soft:           '0 1px 2px rgba(28,27,26,0.04), 0 4px 12px rgba(28,27,26,0.05)',
        card:           '0 2px 4px rgba(28,27,26,0.05), 0 14px 32px -10px rgba(28,27,26,0.10)',
        lift:           '0 12px 24px -8px rgba(28,27,26,0.12), 0 28px 56px -18px rgba(28,27,26,0.16)',
        glow:           '0 10px 26px -8px rgba(0,56,255,0.40)',   // electric cobalt
        'glow-primary': '0 10px 26px -8px rgba(0,47,167,0.36)',   // royal cobalt
        'inner-soft':   'inset 0 1px 2px rgba(28,27,26,0.05)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backgroundImage: {
        // Soft, clean ambient vignette: faint cobalt haze settling over bone.
        dawn:
          'radial-gradient(120% 80% at 50% -10%, rgba(0,47,167,0.06), transparent 60%), radial-gradient(100% 60% at 88% 0%, rgba(0,56,255,0.04), transparent 55%), linear-gradient(180deg, #FDFDFC 0%, #FBFBF9 45%, #F7F5F0 100%)',
        'primary-sheen': 'linear-gradient(135deg, #0038FF 0%, #002FA7 100%)', // electric -> royal cobalt
        'accent-sheen':  'linear-gradient(135deg, #5C8B74 0%, #467259 100%)', // sage
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
          '0%, 100%': { boxShadow: '0 10px 26px -8px rgba(0,56,255,0.32)' },
          '50%':      { boxShadow: '0 14px 34px -8px rgba(0,56,255,0.52)' },
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
