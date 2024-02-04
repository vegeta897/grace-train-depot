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
			animation: {
				fade: 'fade 150ms ease-out',
				'fade-in': 'fade 1s ease-in',
				pop: 'pop 150ms',
			},
			keyframes: {
				fade: {
					'0%': { opacity: 0 },
					'100%': { opacity: 1 },
				},
				pop: {
					'0%': { transform: 'scale(0.95)', transitionTimingFunction: 'ease-out' },
					'30%': { transform: 'scale(1.02)', transitionTimingFunction: 'ease-in' },
					'100%': { transform: 'scale(1)' },
				},
			},
			aspectRatio: {
				'4-3': '4 / 3',
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
