/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-soft': 'var(--surface-soft)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        button: 'var(--button)',
        cta: 'var(--cta)',
        outline: 'var(--outline)',
        'accent-ring': 'var(--accent-ring)',
      },
    },
  },
  plugins: [],
};
