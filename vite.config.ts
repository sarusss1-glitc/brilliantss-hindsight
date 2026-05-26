/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages uses a subpath; Vercel (and local dev) use site root.
const base =
  process.env.GITHUB_ACTIONS === "true" ? "/brilliantss-hindsight/" : "/";

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
