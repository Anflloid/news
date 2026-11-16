module.exports = {
  root: true,
  env: { node: true, es2022: true, jest: true },
  extends: ['airbnb-base', 'prettier'],
  rules: {
    'no-console': 'off',
    'no-param-reassign': ['error', { props: false }],
  },
};
