/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F5F2FF',
          100: '#F2EEFF',
          200: '#E4DBFF',
          300: '#CDB8FF',
          400: '#A87DFB',
          500: '#8B5CF6',
          600: '#6D3DF5',
          700: '#5B2FDE',
          800: '#4F24C6',
          900: '#3D1B99',
        },
        lavender: '#F2EEFF',
        surface: '#F8F7FC',
        ink: {
          900: '#1E1B2E',
          700: '#3F3B54',
          500: '#6B6680',
          400: '#8B8698',
          300: '#B4AFC6',
        },
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        danger: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        info: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 2px 10px 0 rgba(76, 29, 149, 0.06)',
        card: '0 4px 24px -4px rgba(76, 29, 149, 0.10)',
        'card-hover': '0 12px 32px -8px rgba(76, 29, 149, 0.18)',
        'card-lg': '0 24px 60px -16px rgba(76, 29, 149, 0.24)',
        glow: '0 8px 30px -6px rgba(109, 61, 245, 0.35)',
        'glow-lg': '0 20px 50px -12px rgba(109, 61, 245, 0.45)',
        'inner-top': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.55)',
      },
      backgroundImage: {
        'purple-gradient':
          'linear-gradient(135deg, #8B5CF6 0%, #6D3DF5 42%, #5B2FDE 78%, #4F24C6 100%)',
        'sidebar-gradient': 'linear-gradient(165deg, #7C4DFF 0%, #6D3DF5 48%, #4F24C6 100%)',
        'grad-primary': 'linear-gradient(135deg, #A87DFB 0%, #6D3DF5 100%)',
        'grad-info': 'linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)',
        'grad-success': 'linear-gradient(135deg, #4ADE80 0%, #16A34A 100%)',
        'grad-warning': 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)',
        'grad-danger': 'linear-gradient(135deg, #F87171 0%, #DC2626 100%)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};
