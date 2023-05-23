const daisyui = require('daisyui')

const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: { borderWidth: { 5: '5px' } },
	},

	plugins: [daisyui],
}

module.exports = config
