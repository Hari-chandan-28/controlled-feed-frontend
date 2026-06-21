/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      colors: {
        // Base
        ink:       '#08090C',
        surface:   '#12141A',
        'surface-2': '#1B1E26',
        card:      'rgba(255,255,255,0.04)',
        // Borders
        border:    'rgba(255,255,255,0.08)',
        // Accent
        primary:   '#FF1E3C',
        'primary-hover': '#E0102C',
        orange:    '#F2994A',
        // Text
        muted:     '#8B8F9C',
        paper:     '#F4F5F7',
        // Live state
        live:      '#00E5A0',
        // Custom colors
        "beam-blue": '#1a2a3a',
        "beam-blue-light": '#2a3f55'
      },
      backgroundImage: {
        // Variant A — locked diagonal beam background
        'beam': `
          linear-gradient(125deg,
            #08090C 0%,
            #08090C 20%,
            #7A1F0F 36%,
            #B8390F 44%,
            #E8472B 50%,
            #F2994A 56%,
            #1a2a3a 68%,
            #0d1520 78%,
            #08090C 90%
          )
        `,
      },
      backdropBlur: {
        glass: '16px',
      },
      boxShadow: {
        glass: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
        glow:  '0 0 24px rgba(255,30,60,0.25)',
      },
      borderRadius: {
        xl2: '20px',
      },
    },
  },
  plugins: [],
};