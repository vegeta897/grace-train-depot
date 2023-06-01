const daisyui = require('daisyui')

const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: { borderWidth: { 5: '5px' }, saturate: { 30: '.30' } },
	},

	plugins: [daisyui],
	daisyui: {
		themes: ['synthwave'],
	},
}

module.exports = config
