module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
          900: '#0c2d6b',
        },
        status: {
          submitted: '#93c5fd',
          under_review: '#fbbf24',
          assigned: '#a78bfa',
          in_progress: '#60a5fa',
          waiting_student: '#f87171',
          resolved: '#86efac',
          closed: '#d1d5db',
          escalated: '#ff6b6b',
        }
      },
      minHeight: {
        screen: '100vh',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
