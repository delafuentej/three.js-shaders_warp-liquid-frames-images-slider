/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // tu archivo HTML principal
    "./src/**/*.{js,jsx,ts,tsx}", // todos los componentes donde usas clases Tailwind
  ],
  theme: {
    extend: {}, // aquí puedes extender colores, fuentes, etc.
  },
  plugins: [], // plugins opcionales de Tailwind si los necesitas
};
