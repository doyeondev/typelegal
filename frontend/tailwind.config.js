// const withMT = require('@material-tailwind/react/utils/withMT')

/** @type {import('tailwindcss').Config} */

// module.exports = withMT({
//   mode: 'jit',
//   content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
//   darkMode: 'class',
//   theme: {
//     extend: {
//       animation: {
//         // Bounces 5 times 1s equals 5 seconds
//         'bounce-short': 'bounce 0.5s linear 1.5',
//       },
//     },
//   },
//   plugins: [require('@tailwindcss/forms'), require('tailwind-scrollbar-hide')],
// })

module.exports = {
	mode: 'jit',
	content: ['./pages/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
	darkMode: 'class',
	theme: {
		extend: {
			animation: {
				// Bounces 5 times 1s equals 5 seconds
				'bounce-short': 'bounce 0.5s linear 1.5',
			},
		},
		// colors: {
		//   blue: '#1fb6ff',
		//   purple: '#7e5bef',
		//   pink: '#ff49db',
		//   orange: '#ff7849',
		//   green: '#13ce66',
		//   yellow: '#ffc82c',
		//   'gray-dark': '#273444',
		//   gray: '#8492a6',
		//   'gray-light': '#d3dce6',
		// },
	},
	// theme: {
	//   // fontFamily:{},
	//   screens: {
	//     sm: '576px',
	//     // => @media (min-width: 576px) { ... }

	//     md: '960px',
	//     // => @media (min-width: 960px) { ... }

	//     lg: '1440px',
	//     // => @media (min-width: 1440px) { ... }
	//     // xl: '1880px',
	//   },
	//   // colors: {
	//   //   primary: {
	//   //     50: '#f5f3ff',
	//   //     100: '#ede9fe',
	//   //     200: '#ddd6fe',
	//   //     300: '#c4b5fd',
	//   //     400: '#a78bfa',
	//   //     500: '#8b5cf6',
	//   //     600: '#7c3aed',
	//   //     700: '#6d28d9',
	//   //     800: '#5b21b6',
	//   //     900: '#4c1d95',
	//   //   },
	//   // },
	// },
	plugins: [require('@tailwindcss/forms'), require('tailwind-scrollbar-hide')],
};
