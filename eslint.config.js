import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      /**
       * Unused Variables/Imports Rule
       *
       * Pattern: Prefix unused imports/vars with underscore (_)
       * Example: import { _UnusedComponent } from './component'
       *
       * This rule enforces code cleanliness by catching unused imports
       * while allowing intentional unused vars via underscore prefix.
       */
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',     // Ignore function args starting with _
          varsIgnorePattern: '^_',     // Ignore variables starting with _
          caughtErrorsIgnorePattern: '^_', // Ignore catch clause params starting with _
          ignoreRestSiblings: true,    // Ignore siblings of rest parameters
        },
      ],

      /**
       * No Explicit Any Rule
       * Encourages proper TypeScript typing
       */
      '@typescript-eslint/no-explicit-any': [
        'warn',
        {
          fixToUnknown: true,  // Suggest using 'unknown' instead
          ignoreRestArgs: false,
        },
      ],
    },
  },
);
