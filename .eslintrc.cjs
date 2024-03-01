module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@', './src'],
        ],
        extensions: ['.js', '.vue'],
      },
    },
    'import/core-modules': [
      'vite',
    ],
  },
  plugins: [
    'simple-import-sort',
  ],
  rules: {
    'import/extensions': ['error', 'ignorePackages', {
      js: 'never',
      mjs: 'never',
      jsx: 'never',
      ts: 'never',
      tsx: 'never',
    }],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**vite**', '**@vitejs**'],
        optionalDependencies: false,
      },
    ],
    'max-len': [
      'error',
      {
        code: 120,
        ignoreStrings: true,
      },
    ],
    'arrow-body-style': 'off',
    'prefer-arrow-callback': 'off',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          [
            '^@?\\w',
            '^@(/.*|$)',
            '^\\.\\.(?!/?$)',
            '^\\.\\./?$',
            '^\\./(?=.*/)(?!/?$)',
            '^\\.(?!/?$)',
            '^\\./?$',
            '^\\u0000',
          ],
        ],
      },
    ],
  },
};
