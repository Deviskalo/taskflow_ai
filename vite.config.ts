import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      // Visualize bundle size
      mode === "analyze" &&
        visualizer({
          open: true,
          filename: "dist/bundle-analyzer.html",
        }),
      // PWA support
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "logo-favicons/favicon.ico",
          "robots.txt",
          "logo-favicons/apple-icon-180x180-0.png",
        ],
        manifest: {
          name: "TaskFlow AI",
          short_name: "TaskFlow",
          description: "AI-Powered Task Management Application",
          theme_color: "#ffffff",
          background_color: "#ffffff",
          display: "standalone",
          start_url: "/",
          scope: "/",
          icons: [
            {
              src: "logo-favicons/android-icon-192x192-0.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "logo-favicons/android-icon-512x512-0.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "logo-favicons/apple-icon-180x180-0.png",
              sizes: "180x180",
              type: "image/png",
              purpose: "apple touch icon",
            },
            {
              src: "logo-favicons/favicon-32x32-0.png",
              sizes: "32x32",
              type: "image/png",
            },
            {
              src: "logo-favicons/favicon-16x16-0.png",
              sizes: "16x16",
              type: "image/png",
            },
          ],
        },
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    optimizeDeps: {
      exclude: ["lucide-react"],
      include: ["react", "react-dom", "react-router-dom"],
    },
    build: {
      sourcemap: mode !== "production",
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: mode === "production",
          drop_debugger: mode === "production",
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            supabase: ["@supabase/supabase-js"],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    server: {
      port: 3000,
      strictPort: true,
      open: true,
    },
    preview: {
      port: 3000,
      strictPort: true,
    },
    define: {
      "import.meta.env.APP_VERSION": JSON.stringify(
        process.env.npm_package_version
      ),
    },
  };
});
