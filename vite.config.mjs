import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "esnext",
  },
  define: {
    // https://github.com/vitejs/vite/issues/1973
    "process.env": process.env,
  },
  plugins: [vue()],
  server: {
    port: 8080,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      // allows @ to work in template - https://github.com/vitejs/vite/issues/2003
      "/@": resolve(__dirname, "./src"),
    },
  },
});
