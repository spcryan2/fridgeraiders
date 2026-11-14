import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(async () => {
  const plugins = [react(), tailwindcss()];

  // HTTPS=1 npm run dev serves the site over https, so phones allow the mic.
  // Needs: npm install -D @vitejs/plugin-basic-ssl (only loaded when asked for).
  if (process.env.HTTPS === "1") {
    const { default: basicSsl } = await import("@vitejs/plugin-basic-ssl");
    plugins.push(basicSsl());
  }

  return {
    plugins,
    server: {
      host: true,
      proxy: {
        "/api": "http://localhost:5001",
      },
    },
  };
});
