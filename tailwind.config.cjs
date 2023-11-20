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
			scale: {
				200: '2',
			},
		},
	},

	plugins: [daisyui],
	daisyui: {
		themes: [
			{
				synthwave: {
					...require('daisyui/src/theming/themes')['[data-theme=synthwave]'],
					neutral: '#270f69',
					'base-100': '#21124a',
					'base-200': '#150B2F',
					'base-300': '#0B0619',
				},
			},
		],
	},
}

module.exports = config
