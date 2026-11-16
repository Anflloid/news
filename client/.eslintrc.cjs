module.exports = {
  root: true,
  env: { browser: true, es2022: true, jest: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { project: './tsconfig.json', tsconfigRootDir: __dirname },
  extends: [
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist', 'e2e', '*.config.*', '.eslintrc.cjs'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/require-default-props': 'off',
    'import/prefer-default-export': 'off',
    'no-alert': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react/state-in-constructor': ['error', 'never'],
    'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
    'jsx-a11y/label-has-associated-control': ['error', { assert: 'either' }],
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['src/setupTests.ts', 'src/test/**', 'src/**/*.test.{ts,tsx}', '*.config.*'] },
    ],
  },
};
