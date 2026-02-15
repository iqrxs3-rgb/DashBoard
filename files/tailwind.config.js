export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        discord: {
          bg: '#36393f',
          darker: '#2c2f33',
          lighter: '#40444b',
          blurple: '#7289da',
          success: '#43b581',
          danger: '#f04747',
          warning: '#faa61a',
        }
      }
    },
  },
  plugins: [],
}