import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['cropperjs'], // Don't pre-bundle cropperjs, let it load on demand
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split vendor chunks for better caching
          if (id.includes('node_modules')) {
            // Don't split React - keep it in main bundle to avoid loading order issues
            // This ensures React is always available when needed
            if (id.includes('react') || id.includes('react-dom')) {
              return undefined; // Keep React in main bundle
            }
            if (id.includes('lucide-react')) {
              return 'lucide';
            }
            if (id.includes('idb')) {
              return 'idb';
            }
            return 'vendor';
          }
          // Don't manually split ImageEditor - let Vite handle lazy loading naturally
        },
        // Ensure proper chunk loading order
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    cssCodeSplit: false,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
})
