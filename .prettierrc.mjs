/** @type {import("prettier").Config} */
export default {
  singleQuote: true,
  semi: true,
  trailingComma: 'all',
  printWidth: 100,
  plugins: ['prettier-plugin-astro'],
  overrides: [
    {
      files: '*.astro',
      options: { parser: 'astro' },
    },
    {
      // wrangler.jsonc has comments — keep them, parse as jsonc
      files: '*.jsonc',
      options: { parser: 'jsonc', trailingComma: 'none' },
    },
  ],
};
