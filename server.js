import { handler } from './build/handler.js'
import polka from 'polka'
import serveStatic from 'serve-static'
import { join } from 'node:path'

const app = polka()

// Serve public path for assets etc.
const publicPath = join(import.meta.url, './public')
app.use(serveStatic(publicPath))

// let SvelteKit handle everything else
app.use(handler)

const port = process.env.PORT || 5180
app.listen(port, () => {
	console.log(`Listening on port ${port}`)
})
