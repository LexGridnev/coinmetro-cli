
module.exports = [
  {
    languageOptions: {
      ecmaVersion: 2017,
      globals: {
        es6: true,
        node: true,
        jest: true,
      },
    },
    rules: {
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-unused-vars': ['warn', { args: 'none' }],
      'no-console': 'off',
    },
  },
];
