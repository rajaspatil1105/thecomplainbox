module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        // Bauhaus Primary Colors
        'bauhaus-bg': '#F0F0F0',
        'bauhaus-fg': '#121212',
        'bauhaus-red': '#D02020',
        'bauhaus-blue': '#1040C0',
        'bauhaus-yellow': '#F0C020',
        'bauhaus-green': '#107050',
        'bauhaus-muted': '#E0E0E0',
        'bauhaus-border': '#121212',
        
        // Status Colors
        'status-submitted': '#E0E0E0',
        'status-under-review': '#F0C020',
        'status-assigned': '#1040C0',
        'status-in-progress': '#1040C0',
        'status-waiting-student': '#F0C020',
        'status-resolved': '#107050',
        'status-closed': '#121212',
        'status-escalated': '#D02020',
        
        // Priority Colors
        'priority-p1': '#D02020',
        'priority-p2': '#C06000',
        'priority-p3': '#F0C020',
        'priority-p4': '#107050',
      },
      boxShadow: {
        'bauhaus-card': '8px 8px 0px 0px #121212',
        'bauhaus-button': '4px 4px 0px 0px #121212',
        'bauhaus-modal': '12px 12px 0px 0px #121212',
        'bauhaus-fab': '4px 4px 0px 0px #121212',
        'bauhaus-topbar': '0px 4px 0px 0px #121212',
      },
      borderWidth: {
        'bauhaus-thick': '4px',
        'bauhaus-thin': '2px',
      },
      fontSize: {
        'bauhaus-sm': ['12px', { fontWeight: '700', letterSpacing: '0.05em' }],
        'bauhaus-base': ['16px', { fontWeight: '500', lineHeight: '1.625' }],
        'bauhaus-lg': ['18px', { fontWeight: '500', lineHeight: '1.625' }],
        'bauhaus-xl': ['20px', { fontWeight: '700' }],
        'bauhaus-2xl': ['28px', { fontWeight: '700' }],
        'bauhaus-3xl': ['32px', { fontWeight: '700' }],
        'bauhaus-4xl': ['48px', { fontWeight: '700' }],
        'bauhaus-6xl': ['60px', { fontWeight: '700' }],
        'bauhaus-8xl': ['96px', { fontWeight: '900' }],
      },
      opacity: {
        '5': '0.05',
        '10': '0.10',
        '25': '0.25',
        '30': '0.30',
      },
      animation: {
        'pulse-custom': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      minWidth: {
        '360px': '360px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
  // Safelist to prevent Tailwind purging dynamic classes
  safelist: [
    'border-l-4',
    'border-[#D02020]',
    'border-[#C06000]',
    'border-[#F0C020]',
    'border-[#107050]',
    'bg-[#D02020]',
    'bg-[#1040C0]',
    'bg-[#F0C020]',
    'bg-[#107050]',
    'bg-[#E0E0E0]',
    'border-[#1040C0]',
    'text-[#D02020]',
    'text-[#1040C0]',
    'fill-[#F0C020]',
    'stroke-[#F0C020]',
  ]
}

