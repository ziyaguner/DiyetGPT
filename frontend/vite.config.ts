import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
    root: './', 

    plugins: [
        react(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
        dedupe: ['react', 'react-dom'] // Bu satır, birden fazla React kopyası sorununu çözer
    },
    server: {
        port: 5174, 
        proxy: {
            '/api': {
                target: 'http://localhost:5000', 
                changeOrigin: true,
                secure: false,
            },
            '/register': {
                target: 'http://localhost:5000', 
                changeOrigin: true,
                secure: false,
            },
            '/login': {
                target: 'http://localhost:5000', 
                changeOrigin: true,
                secure: false,
            },
            '/logout': {
                target: 'http://localhost:5000', 
                changeOrigin: true,
                secure: false,
            },
        },
    },
}));