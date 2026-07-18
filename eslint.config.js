import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default tseslint.config(
  {
    // Not linted: build output, generated types, deps.
    ignores: ['dist/', '.astro/', 'node_modules/', 'worker-configuration.d.ts'],
  },

  js.configs.recommended,

  {
    // Type-aware linting only on real TS files. typescript-eslint can't
    // resolve the `astro:content` virtual types inside .astro components,
    // so running type-checked rules there produces false "unresolved type"
    // errors. `astro check` type-checks the .astro files instead.
    files: ['**/*.{ts,mts,cts}'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.node },
    },
    rules: {
      // The loaders lean hard on await — a dropped one silently yields
      // empty collections, so treat floating promises as errors.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  {
    // Astro's LoaderContext is designed to be destructured
    // ({ store, renderMarkdown, parseData, ... }) — unbound-method is a
    // false positive for that documented API pattern.
    files: ['src/content.config.ts'],
    rules: { '@typescript-eslint/unbound-method': 'off' },
  },

  // Astro components: syntax + Astro-specific rules, no type-aware rules.
  ...astro.configs.recommended,
  {
    files: ['**/*.astro'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
);
