import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vitePreloadPlugin from "vite-plugin-preload";
import glsl from "vite-plugin-glsl";

// https://vite.dev/config/
export default defineConfig({
  build: {
    minify: "esbuild",
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
    terserOptions: {
      compress: {
        drop_console: true, // elimina console.log
        drop_debugger: true,
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
  ],
});
