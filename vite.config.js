import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],

    build: {
        chunkSizeWarningLimit: 2000,

        rollupOptions: {
            output: {
                manualChunks: {
                    reactVendor: ['react', 'react-dom'],
                },
            },
        },
    },
});