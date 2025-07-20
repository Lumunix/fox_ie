import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    cors: true,
    // Allow embedding in Django template
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
});
