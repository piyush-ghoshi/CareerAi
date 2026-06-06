/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0A0F1E',
        'bg-secondary': '#0D1B2A',
        'bg-card': '#111827',
        'border-default': '#1E3A5F',
        'accent-blue': '#3B82F6',
        'accent-cyan': '#06B6D4',
        'accent-green': '#10B981',
        'accent-amber': '#F59E0B',
        'accent-red': '#EF4444',
        'accent-purple': '#8B5CF6',
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
      },
      fontFamily: {
        'grotesk': ['Space Grotesk', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-slow': 'pulse 2s infinite',
        'pulse-fast': 'pulse 0.8s infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-up': 'fadeUp 0.6s ease both',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
