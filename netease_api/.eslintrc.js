module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['html'],
  extends: ['plugin:prettier/recommended'],
  env: {
    browser: true,
    node: true,
  },

  rules: {
    indent: ['error', 2, { SwitchCase: 1 }],
    'space-infix-ops': ['error', { int32Hint: false }],
    'key-spacing': [
      2,
      {
        beforeColon: false,
        afterColon: true,
      },
    ],
    'no-octal': 2,
    'no-redeclare': 2,
    'comma-spacing': 2,
    'no-new-object': 2,
    'arrow-spacing': 2,
    quotes: [
      2,
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      extends: [
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        'prettier/@typescript-eslint',
      ],
    },
  ],
}
