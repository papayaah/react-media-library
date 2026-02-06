import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        react(),
        dts({
            insertTypesEntry: false,
        }),
    ],
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts'),
                server: resolve(__dirname, 'src/server.ts'),
                'server/nextjs/routes': resolve(__dirname, 'src/server/nextjs/routes.ts'),
            },
            formats: ['es', 'cjs'],
            fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'mjs' : 'js'}`,
        },
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                'lucide-react',
                'next/server',
                'sharp',
                // Node.js built-ins for server code
                'fs',
                'fs/promises',
                'path',
                'crypto',
                'stream',
                'util',
            ],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'lucide-react': 'LucideReact',
                },
            },
        },
    },
});
