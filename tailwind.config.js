/** @type {import('tailwindcss').Config} */
module.exports = {
  // purge: ['/website/*.ejs'], // You have commented out the purge option, which means it's currently not active.
  content: [
          // Path to .ejs files
    "./views/**/*.{html,js,ejs}"  // Path to .html and .js files in the views directory
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
