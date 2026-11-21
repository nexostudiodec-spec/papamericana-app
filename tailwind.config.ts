import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17233A',
        paper: '#F7F7F4',
        brand: '#F3C623',
      },
      fontFamily: { sans: ['Arial', 'Helvetica', 'sans-serif'] },
    },
  },
  plugins: [],
};

export default config;
