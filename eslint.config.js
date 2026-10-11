import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage', 'storybook-static', 'docs'] },
  js.configs.recommended,
  react.configs.flat.recommended,
  ...tseslint.configs.recommended,
  prettier,
  ...storybook.configs['flat/recommended'],
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      'react/react-in-jsx-scope': 'off',
      camelcase: ['error', { allow: ['preserve_annotations'] }],
      'spaced-comment': [
        'error',
        'always',
        { line: { markers: ['/'] }, block: { markers: ['#__PURE__'] } },
      ],
      quotes: ['warn', 'single'],
      '@typescript-eslint/no-namespace': 'off',
      'no-duplicate-imports': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
);
