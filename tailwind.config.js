/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.{html,js}", "./public/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff7e5f', // Definiendo el color primary
          '90': '#ff7e5f90' // Definiendo primary con 90% de opacidad
        },
        background: '#f7fafc', // Definiendo el color background
        muted: '#e2e8f0', // Definiendo un color muted para hover
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}