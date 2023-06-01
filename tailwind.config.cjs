const daisyui = require('daisyui')

const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: { borderWidth: { 5: '5px' }, saturate: { 30: '.30' } },
	},

	plugins: [daisyui],
	daisyui: {
		themes: [
			{
				synthwave: {
					...require('daisyui/src/theming/themes')['[data-theme=synthwave]'],
					'base-200': '#160d34',
				},
			},
		],
	},
}

module.exports = config
