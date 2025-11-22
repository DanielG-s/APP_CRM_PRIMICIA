/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // AQUI ESTAVA O ERRO: Tiramos o "src" do caminho
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}