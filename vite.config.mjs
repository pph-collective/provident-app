import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "esnext",
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Bulma 0.9.x is unmaintained and uses deprecated Sass APIs
        silenceDeprecations: ["import", "global-builtin", "color-functions", "if-function"],
        quietDeps: true,
      },
    },
  },
  plugins: [vue()],
  server: {
    port: 8080,
  },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
      // allows @ to work in template - https://github.com/vitejs/vite/issues/2003
      "/@": resolve(import.meta.dirname, "./src"),
    },
  },
});
