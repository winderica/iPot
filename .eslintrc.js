module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  root: true,
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    indent: ['warn', 2, { SwitchCase: 1 }],
    'max-len': ['warn', { code: 120 }],
    'quote-props': ['warn', 'as-needed'],
    'jsx-quotes': ['warn', 'prefer-single'],
    'arrow-parens': ['warn', 'always'],
    'no-empty': ['warn', { allowEmptyCatch: true }],
    'padded-blocks': ['warn', 'never'],
    'lines-between-class-members': ['warn', 'always', { exceptAfterSingleLine: true }],
    'no-trailing-spaces': ['warn'],
    'object-curly-spacing': ['warn', 'always'],
    'react/prop-types': 'off',
    'react/jsx-closing-bracket-location': ['warn'],
    'react/jsx-closing-tag-location': ['warn'],
    'react/jsx-curly-newline': ['warn'],
    'react/jsx-first-prop-new-line': ['warn'],
    'react/jsx-tag-spacing': ['warn', {
      closingSlash: 'never',
      beforeSelfClosing: 'always',
      afterOpening: 'never',
      beforeClosing: 'never',
    }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/quotes': [
      'warn',
      'single',
      {
        avoidEscape: true,
      },
    ],
    '@typescript-eslint/semi': ['warn', 'always'],
    '@typescript-eslint/comma-dangle': ['warn', 'always-multiline'],
    '@typescript-eslint/member-delimiter-style': ['warn'],
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/default': 'off',
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {},
    },
    react: {
      version: 'detect'
    }
  },
  env: {
    webextensions: true,
  }
};
