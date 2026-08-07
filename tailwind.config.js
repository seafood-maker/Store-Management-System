/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",           // 根目錄下的 App.tsx, main.tsx 等
    "./pages/**/*.{js,ts,jsx,tsx}",    // pages 資料夾內所有檔案
    "./components/**/*.{js,ts,jsx,tsx}", // components 資料夾內所有檔案
    "./store/**/*.{js,ts,jsx,tsx}",      // store 資料夾
  ],
  theme: {
    extend: {
      // 如果你未來想要統一管理品牌綠色，可以加在這裡
      colors: {
        brand: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
      },
    },
  },
  plugins: [],
}
