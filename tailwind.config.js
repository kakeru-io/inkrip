/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				color1: '#004CA0',
				color2: '#C0E4FF',
				color3: '#B78F00',
				textColor: '#0F0101',
				linkColor: '#00B2FF',
				backgroundColor: '#FFFFFF'
			},
			fontFamily: {
				en: ['Spartan', 'sans-serif'],
				jp: ['Noto Sans JP', 'sans-serif']
			},
			fontSize: {
				xs: '.75rem',
				sm: '.875rem',
				base: '1rem',
				lg: '1.125rem',
				xl: '1.25rem',
				'2xl': '1.5rem',
				'3xl': '1.875rem',
				'4xl': '2.25rem',
				'5xl': '3rem',
				'6xl': '4rem'
			}
		}
	},
	plugins: []
};
