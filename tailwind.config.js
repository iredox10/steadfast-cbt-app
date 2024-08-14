/** @type {import('tailwindcss').Config} */
export default {
   content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.vue",
  ],
  theme: {
    extend: {
      colors:{
        'white-color': '#EEEDED',
        'secondary-color': '#DCD8D8' 
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
        'oswald': ['Oswald', 'sans-serif'],
        // Add other fonts here
      },
    },
  },
  plugins: [],
}

