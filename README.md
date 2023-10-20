# Choo Choo!

Customize your Grace Train car!

What's a Grace Train? [Watch this](https://twitter.com/vegeta897/status/1644466753463001088)

## How to run

1. `npm i`
2. Create `.env` file
3. `npx prisma migrate deploy`
4. `npm run build`
5. `ORIGIN=https://example.com PORT=5180 node server.js` (on Windows: `set "ORIGIN=https://example.com" && set "PORT=5180" && node server.js`)

### PM2 ecosystem config

```json
{
	"apps": [
		{
			"name": "choo-choo",
			"script": "./choo-choo/server.js",
			"log_date_format": "YYYY-MM-DD HH:mm:ss",
			"env": {
				"PORT": 5180,
				"ORIGIN": "https://example.com"
			}
		}
	]
}
```

_Made with [SvelteKit](https://kit.svelte.dev)_
