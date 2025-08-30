import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(() => {
  // eslint-disable-next-line no-undef
  return {
    plugins: [
      vue(),
    ],
    resolve: {
      alias: [
          {
            find: '@',
            replacement: fileURLToPath(new URL('./src', import.meta.url))
          }
      ]
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks: {
            ui: ['vue', 'primevue'],
            cm: ['codemirror'],
            tiptap:[
                  "@tiptap/extension-color",
                  "@tiptap/extension-highlight",
                  "@tiptap/extension-image",
                  "@tiptap/extension-link",
                  "@tiptap/extension-list-item",
                  "@tiptap/extension-mention",
                  "@tiptap/extension-placeholder",
                  "@tiptap/extension-text-style",
                  "@tiptap/extension-typography",
                  "@tiptap/starter-kit",
                  "@tiptap/vue-3",
                  "tiptap-markdown",
            ]
          }
        }
      }
    },
    server: {
      hmr: {
        path: '/hmr'
      },
      allowedHosts: ['jase.zenfolie.org']
    }
  }
})
