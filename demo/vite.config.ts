import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@buzzer/media-library': path.resolve(__dirname, '../src'),
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['cropperjs'], // Don't pre-bundle cropperjs, let it load on demand
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
          // Handle the local @buzzer/media-library package - bundle it with the main code
          if (id.includes('@buzzer/media-library') || id.includes('/media-library/src/')) {
            return undefined; // Bundle it in the main chunk
          }
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
