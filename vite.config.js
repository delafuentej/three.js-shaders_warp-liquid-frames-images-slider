import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vitePreloadPlugin from "vite-plugin-preload";
import glsl from "vite-plugin-glsl";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  build: {
    minify: "esbuild",
    target: "esnext",
    terserOptions: {
      compress: {
        drop_console: true, // elimina console.log
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 2000, // en KB
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          react: ["react", "react-dom"],
          gsap: ["gsap"],
        },
      },
    },
  },
  plugins: [
    react(),
    vitePreloadPlugin({
      rel: "preload",
      as: "style",
      includeCss: true,
      includeJs: false,
    }),
    glsl({
      include: ["**/*.glsl", "**/*.wgsl", "**/*.vert", "**/*.frag"],
    }),
    tailwindcss(),
  ],
});
