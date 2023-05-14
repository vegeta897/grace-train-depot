import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [sveltekit()],
	server: { port: 5180 },
	optimizeDeps: {
		exclude: ['grace-train-lib'],
		// force: true,
	},
})
