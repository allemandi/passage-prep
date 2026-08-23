import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
    const fallbacks = {
        VITE_APP_TITLE: 'PassagePrep',
        VITE_APP_TAGLINE: 'Build reusable Bible studies in seconds',
        VITE_APP_DESCRIPTION: 'Format, organize, and export Bible study questions with ease.',
        VITE_APP_URL: 'https://passage-prep.netlify.app'
    };

    for (const [key, val] of Object.entries(fallbacks)) {
        if (!process.env[key]) {
            process.env[key] = val;
        }
    }

    const env = { ...fallbacks, ...loadEnv(mode, process.cwd(), '') };

    const htmlPlugin = () => {
        return {
            name: 'html-transform',
            enforce: 'pre',
            transformIndexHtml(html) {
                return html.replace(/%(VITE_APP_[A-Z_]+)%/g, (match, key) => {
                    return env[key] || match;
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
        envPrefix: ['VITE_', 'VITE_APP_'],
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
