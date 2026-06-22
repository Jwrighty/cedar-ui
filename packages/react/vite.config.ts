import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import preserveDirectives from "rollup-preserve-directives";

export default defineConfig({
  // preserveDirectives keeps the `"use client"` banner that React Aria leaf
  // components carry — without it Rollup strips the directive and Next.js App
  // Router consumers break on import (ADR-0008).
  plugins: [react({ jsxRuntime: "automatic" }), preserveDirectives()],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react-aria-components",
      ],
      output: {
        preserveModules: false,
        assetFileNames: "styles.css",
      },
    },
    cssCodeSplit: false,
  },
});
