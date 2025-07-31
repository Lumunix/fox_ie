import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Keep the existing preprocess configuration
    preprocess: vitePreprocess(),

    kit: {
        // Configure the static adapter with proper output paths
        adapter: adapter({
            // Output to Django's static directory
            pages: '../static/dist/sveltekit',
            assets: '../static/dist/sveltekit',
            fallback: null,
            precompress: false,
            strict: true
        }),
        // Configure paths for static serving
        paths: {
            base: '/static/dist/sveltekit',
        },
        // Configure what directories should be treated as static assets
        files: {
            assets: 'static',
            lib: 'src/lib',
            routes: 'src/routes'
        }
    }
};

export default config;
