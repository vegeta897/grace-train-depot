const daisyui = require('daisyui')

const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			borderWidth: { 5: '5px' },
			saturate: { 70: '.70' },
			screens: {
				xs: '480px',
				'2xs': '375px',
			},
		},
	},

	plugins: [daisyui],
	daisyui: {
		themes: [
			{
				synthwave: {
					...require('daisyui/src/theming/themes')['[data-theme=synthwave]'],
					neutral: '#25185d',
					'base-100': '#1d124a',
					'base-200': '#140d35',
					'base-300': '#0e0925',
				},
			},
		],
	},
}

module.exports = config
