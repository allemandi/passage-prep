import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_APP_');

    const htmlPlugin = () => {
        return {
            name: 'html-transform',
            transformIndexHtml(html) {
                return html.replace(/%(VITE_APP_[A-Z_]+)%/g, (match, key) => {
                    const value = env[key];
                    if (value !== undefined) return value;

                    // Fallbacks matching src/utils/seoConfig.js
                    const fallbacks = {
                        VITE_APP_TITLE: 'PassagePrep',
                        VITE_APP_TAGLINE: 'Build reusable Bible studies in seconds',
                        VITE_APP_DESCRIPTION: 'Format, organize, and export Bible study questions with ease.',
                        VITE_APP_URL: 'https://passage-prep.netlify.app'
                    };
                    return fallbacks[key] || match;
                });
            },
        };
    };

    return {
        plugins: [
            react(),
            tailwindcss(),
            htmlPlugin()
        ],
        root: path.resolve(__dirname),
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
        },
        server: {
            port: 5173,
        },
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: './src/setupTests.js',
        },
        build: {
            outDir: 'build',
            emptyOutDir: true,
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            return 'vendor';
                        }
                    }
                }
            },
            chunkSizeWarningLimit: 600,
        },
    };
});
