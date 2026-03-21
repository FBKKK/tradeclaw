/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0d1117',
        'bg-secondary': '#161b22',
        'bg-tertiary': '#21262d',
        border: '#30363d',
        text: '#e6edf3',
        'text-muted': '#8b949e',
        accent: '#58a6ff',
        'accent-dim': 'rgba(31, 111, 235, 0.2)',
        green: '#3fb950',
        red: '#f85149',
        purple: '#a78bfa',
        'purple-dim': 'rgba(139, 92, 246, 0.2)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', 'Noto Sans CJK SC', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'Cascadia Code', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
