// vite.config.ts
import { defineConfig } from "file:///Volumes/Data/Sites/me/appframes/node_modules/vite/dist/node/index.js";
import react from "file:///Volumes/Data/Sites/me/appframes/node_modules/@vitejs/plugin-react/dist/index.js";
import dts from "file:///Volumes/Data/Sites/me/appframes/node_modules/vite-plugin-dts/dist/index.mjs";
import { resolve } from "path";
var __vite_injected_original_dirname = "/Volumes/Data/Sites/me/appframes/packages/media-library";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: false
    })
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__vite_injected_original_dirname, "src/index.ts"),
        server: resolve(__vite_injected_original_dirname, "src/server.ts"),
        "server/nextjs/routes": resolve(__vite_injected_original_dirname, "src/server/nextjs/routes.ts")
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => `${entryName}.${format === "es" ? "mjs" : "js"}`
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "lucide-react",
        "next/server",
        "sharp",
        // Node.js built-ins for server code
        "fs",
        "fs/promises",
        "path",
        "crypto",
        "stream",
        "util"
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "lucide-react": "LucideReact"
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVm9sdW1lcy9EYXRhL1NpdGVzL21lL2FwcGZyYW1lcy9wYWNrYWdlcy9tZWRpYS1saWJyYXJ5XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVm9sdW1lcy9EYXRhL1NpdGVzL21lL2FwcGZyYW1lcy9wYWNrYWdlcy9tZWRpYS1saWJyYXJ5L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Wb2x1bWVzL0RhdGEvU2l0ZXMvbWUvYXBwZnJhbWVzL3BhY2thZ2VzL21lZGlhLWxpYnJhcnkvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgZHRzIGZyb20gJ3ZpdGUtcGx1Z2luLWR0cyc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gICAgcGx1Z2luczogW1xuICAgICAgICByZWFjdCgpLFxuICAgICAgICBkdHMoe1xuICAgICAgICAgICAgaW5zZXJ0VHlwZXNFbnRyeTogZmFsc2UsXG4gICAgICAgIH0pLFxuICAgIF0sXG4gICAgYnVpbGQ6IHtcbiAgICAgICAgbGliOiB7XG4gICAgICAgICAgICBlbnRyeToge1xuICAgICAgICAgICAgICAgIGluZGV4OiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9pbmRleC50cycpLFxuICAgICAgICAgICAgICAgIHNlcnZlcjogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvc2VydmVyLnRzJyksXG4gICAgICAgICAgICAgICAgJ3NlcnZlci9uZXh0anMvcm91dGVzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvc2VydmVyL25leHRqcy9yb3V0ZXMudHMnKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmb3JtYXRzOiBbJ2VzJywgJ2NqcyddLFxuICAgICAgICAgICAgZmlsZU5hbWU6IChmb3JtYXQsIGVudHJ5TmFtZSkgPT4gYCR7ZW50cnlOYW1lfS4ke2Zvcm1hdCA9PT0gJ2VzJyA/ICdtanMnIDogJ2pzJ31gLFxuICAgICAgICB9LFxuICAgICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgICAgICBleHRlcm5hbDogW1xuICAgICAgICAgICAgICAgICdyZWFjdCcsXG4gICAgICAgICAgICAgICAgJ3JlYWN0LWRvbScsXG4gICAgICAgICAgICAgICAgJ2x1Y2lkZS1yZWFjdCcsXG4gICAgICAgICAgICAgICAgJ25leHQvc2VydmVyJyxcbiAgICAgICAgICAgICAgICAnc2hhcnAnLFxuICAgICAgICAgICAgICAgIC8vIE5vZGUuanMgYnVpbHQtaW5zIGZvciBzZXJ2ZXIgY29kZVxuICAgICAgICAgICAgICAgICdmcycsXG4gICAgICAgICAgICAgICAgJ2ZzL3Byb21pc2VzJyxcbiAgICAgICAgICAgICAgICAncGF0aCcsXG4gICAgICAgICAgICAgICAgJ2NyeXB0bycsXG4gICAgICAgICAgICAgICAgJ3N0cmVhbScsXG4gICAgICAgICAgICAgICAgJ3V0aWwnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG91dHB1dDoge1xuICAgICAgICAgICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICAgICAgICAgICAgcmVhY3Q6ICdSZWFjdCcsXG4gICAgICAgICAgICAgICAgICAgICdyZWFjdC1kb20nOiAnUmVhY3RET00nLFxuICAgICAgICAgICAgICAgICAgICAnbHVjaWRlLXJlYWN0JzogJ0x1Y2lkZVJlYWN0JyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVWLFNBQVMsb0JBQW9CO0FBQ3BYLE9BQU8sV0FBVztBQUNsQixPQUFPLFNBQVM7QUFDaEIsU0FBUyxlQUFlO0FBSHhCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLFNBQVM7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLElBQUk7QUFBQSxNQUNBLGtCQUFrQjtBQUFBLElBQ3RCLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDSCxLQUFLO0FBQUEsTUFDRCxPQUFPO0FBQUEsUUFDSCxPQUFPLFFBQVEsa0NBQVcsY0FBYztBQUFBLFFBQ3hDLFFBQVEsUUFBUSxrQ0FBVyxlQUFlO0FBQUEsUUFDMUMsd0JBQXdCLFFBQVEsa0NBQVcsNkJBQTZCO0FBQUEsTUFDNUU7QUFBQSxNQUNBLFNBQVMsQ0FBQyxNQUFNLEtBQUs7QUFBQSxNQUNyQixVQUFVLENBQUMsUUFBUSxjQUFjLEdBQUcsU0FBUyxJQUFJLFdBQVcsT0FBTyxRQUFRLElBQUk7QUFBQSxJQUNuRjtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ1gsVUFBVTtBQUFBLFFBQ047QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUE7QUFBQSxRQUVBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNKO0FBQUEsTUFDQSxRQUFRO0FBQUEsUUFDSixTQUFTO0FBQUEsVUFDTCxPQUFPO0FBQUEsVUFDUCxhQUFhO0FBQUEsVUFDYixnQkFBZ0I7QUFBQSxRQUNwQjtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
