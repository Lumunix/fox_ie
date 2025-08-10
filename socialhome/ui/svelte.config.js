import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			// Output directory for the built files
			out: '../static/dist/sveltekit'
		}),
		files: {
			assets: 'static'
		},
		paths: {
			base: ''
		}
	}
};

export default config;
