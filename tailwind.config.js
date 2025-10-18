/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        christmas: {
          red: '#DC2626',
          green: '#059669',
          gold: '#F59E0B',
          snow: '#F8FAFC',
        }
      },
      animation: {
        'snow': 'snow 10s linear infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite alternate',
      },
      keyframes: {
        snow: {
          '0%': { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        twinkle: {
          '0%': { opacity: 0.3 },
          '100%': { opacity: 1 },
        },
      }
    },
  },
  plugins: [],
}
