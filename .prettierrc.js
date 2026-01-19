// @see https://prettier.io/docs/en/configuration.html
/** @type {import("prettier").Config} */
const config = {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
  plugins: ['prettier-plugin-tailwindcss'],
}

module.exports = config
