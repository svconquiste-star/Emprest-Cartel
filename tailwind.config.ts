import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand': '#ff1744',
        'brand-strong': '#d81b3f',
        'accent': '#ff1744',
        'accent-strong': '#c41e3a',
      },
      fontFamily: {
        'sans': ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 20px 60px rgba(255,23,68,.25)',
      },
    },
  },
  plugins: [],
}
export default config
