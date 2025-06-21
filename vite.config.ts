import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import { fileURLToPath, URL } from 'node:url';
import { securityHeaders } from './vite.config.security-headers';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  // Log environment in development
  if (mode === 'development') {
    console.log('Environment variables loaded:', Object.keys(env));
  }

  return {
    plugins: [
      react(),
      // Security headers in development
      securityHeaders(),
      // Visualize bundle size
      mode === 'analyze' && visualizer({
        open: true,
        filename: 'dist/bundle-analyzer.html',
      }),
      // PWA support
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'TaskFlow AI',
          short_name: 'TaskFlow',
          description: 'AI-Powered Task Management Application',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            // Main app icon
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            // Maskable icon for Android
            {
              src: 'pwa-192x192-maskable.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            // Larger icon for splash screens
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            // Maskable large icon
            {
              src: 'pwa-512x512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
      include: ['react', 'react-dom', 'react-router-dom'],
    },
    build: {
      sourcemap: mode !== 'production',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            supabase: ['@supabase/supabase-js'],
          },
          // Ensure proper module preloading
          experimentalMinChunkSize: 10000,
        },
        // Disable module preload for now to prevent warnings
        preserveEntrySignatures: 'strict',
      },
      chunkSizeWarningLimit: 1000,
      target: 'esnext',
      // Disable module preload polyfill
      modulePreload: false,
      // Enable dynamic imports for better code splitting
      dynamicImportVarsOptions: {
        exclude: [],
      },
    },
    server: (() => {
      const serverConfig: import('vite').ServerOptions = {
        port: 3000,
        strictPort: true,
        hmr: {
          overlay: true,
        },
        // Enable CORS for development
        cors: true,
      };

      // Enable HTTPS in development if configured
      if (process.env.HTTPS === 'true') {
        serverConfig.https = {
          key: process.env.SSL_KEY_PATH,
          cert: process.env.SSL_CERT_PATH,
        };
      }

      return serverConfig;
    })(),
    preview: {
      port: 3000,
      strictPort: true,
    },
    define: {
      'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version),
    },
  };
});
