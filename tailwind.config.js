/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",       // app/ 밑에 있는 모든 파일
    "./components/**/*.{js,ts,jsx,tsx}", // components/ 밑에 있는 모든 파일
    "./hooks/**/*.{js,ts,jsx,tsx}",      // hooks/ 안의 TS/TSX
    "./lib/**/*.{js,ts,jsx,tsx}",        // lib/ 안의 TS/TSX
    "./styles/**/*.{css,scss}",          // 스타일 파일
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
