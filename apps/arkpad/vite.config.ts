import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
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
