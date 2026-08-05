/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#14110F',
        panel: '#1E1A16',
        panel2: '#26211C',
        ember: '#D9483C',
        marquee: '#E8A33D',
        cream: '#F1EAD9',
        muted: '#9C9284',
      },
      fontFamily: {
        display: ['"Oswald"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
