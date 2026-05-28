/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**']
  },
  {
    files: ['src/**/*.ts'],
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin')
    },
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-console': 'off'
    }
  },
  require('eslint-config-prettier')
]
