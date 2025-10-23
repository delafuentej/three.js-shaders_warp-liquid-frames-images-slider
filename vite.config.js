import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import glsl from "vite-plugin-glsl";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    glsl({
      include: [
        // Qué archivos aceptar
        "**/*.glsl",
        "**/*.wgsl",
        "**/*.vert",
        "**/*.frag",
      ],
    }),
    tailwindcss(),
  ],
});
