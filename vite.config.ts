import { sveltekit } from '@sveltejs/kit/vite'
import { viteAssetPlugin } from './vite-asset-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [sveltekit(), viteAssetPlugin()],
	server: { port: 5180 },
	optimizeDeps: {
		exclude: ['grace-train-lib'],
		force: true, // is this necessary?
	},
})
