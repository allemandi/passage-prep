module.exports = {
  darkMode: 'class', // <-- this enables manual toggling with 'dark' class
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          300: '#90caf9',
          400: '#42a5f5',
          600: '#1e88e5',
          700: '#1565c0',
        },
      },
    },
  },
  plugins: [],
};
