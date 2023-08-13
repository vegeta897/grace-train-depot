// https://github.com/sveltejs/kit/discussions/10162#discussioncomment-6401160
import serveStatic from 'serve-static'
const assets = serveStatic('public')
const configureServer = (server: any) => {
	server.middlewares.use(assets)
}
export const viteAssetPlugin = () => ({
	name: 'vite-asset-plugin',
	configureServer,
	configurePreviewServer: configureServer,
})
