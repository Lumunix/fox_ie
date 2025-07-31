import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'url';



export default defineConfig({
    plugins: [tailwindcss(), sveltekit()],


    build: {
        // Ensure source maps are generated
        sourcemap: true,
        // Configure output directory
        outDir: fileURLToPath(new URL('../static/dist/sveltekit', import.meta.url)),
    },
    base: '/static/dist/sveltekit/',
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '$lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
            '$components': fileURLToPath(new URL('./src/lib/components', import.meta.url)),
            '$stores': fileURLToPath(new URL('./src/lib/stores', import.meta.url))
        }
    },
    server: {
        cors: true,
        // Allow embedding in Django template
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    }

});
