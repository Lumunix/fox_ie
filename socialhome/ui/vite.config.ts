import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte() // <-- Must come after Tailwind
  ],
  build: {
    outDir: '../static/dist/svelte',
    emptyOutDir: true,
    manifest: true, // Re-enable manifest
    rollupOptions: {
      input: {
        main: './src/main.ts',
      },
      // Remove custom output config to let Vite handle cache busting
    },
  },
  base: '/static/dist/svelte/',
  server: {
    host: '127.0.0.1',
    port: 5173,
    origin: 'http://127.0.0.1:5173'
  }
});
