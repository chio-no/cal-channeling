import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicCsl from "@vitejs/plugin-basic-ssl";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
});
