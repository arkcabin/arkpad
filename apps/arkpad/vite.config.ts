import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "react": path.resolve(__dirname, "../../node_modules/react"),
      "react-dom": path.resolve(__dirname, "../../node_modules/react-dom"),
      "@arkpad/react": path.resolve(__dirname, "../../packages/react/src")
    }
  },
  optimizeDeps: {
    exclude: ["@arkpad/core", "@arkpad/react", "@arkpad/starter-kit", "@arkpad/extension-ai"]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "editor-core": ["@arkpad/core", "@arkpad/react"],
          prosemirror: [
            "prosemirror-model",
            "prosemirror-state",
            "prosemirror-view",
            "prosemirror-transform",
            "prosemirror-commands",
            "prosemirror-keymap",
            "prosemirror-tables",
          ],
          vendor: ["react", "react-dom", "lucide-react"],
        },
      },
    },
  },
});
