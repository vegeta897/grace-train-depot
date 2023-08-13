import { handler } from './build/handler.js'
import polka from 'polka'
import serveStatic from 'serve-static'
import { join } from 'node:fs'

const app = polka()

// Serve public path for assets etc.
const publicPath = join(import.meta.url, './public')
app.use(serveStatic(publicPath))

// let SvelteKit handle everything else
app.use(handler)

app.listen(3000, () => {
	console.log('listening on port 3000')
})
