/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

module.exports = {
  extends: [
    // We will use the default rules from the plugins we have installed.
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
    'plugin:@typescript-eslint/recommended',
    // Disable any rules that conflict with prettier in ESLint.
    // Place this below to override the above rules!
    'eslint-config-prettier',
    'prettier'
  ],
  plugins: ['prettier'],
  settings: {
    react: {
      // Let eslint-plugin-react automatically detect the React version.
      version: 'detect'
    },
    // Instruct ESLint on how to handle imports.
    'import/resolver': {
      node: {
        paths: [path.resolve(__dirname, '')],
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      },
      typescript: {
        project: path.resolve(__dirname, './tsconfig.json')
      }
    }
  },
  env: {
    node: true
  },
  rules: {
    // Turn off the rule that requires importing React in JSX files.
    'react/react-in-jsx-scope': 'off',
    // Emit a warning when the <a target='_blank'> tag is used without rel="noreferrer".
    'react/jsx-no-target-blank': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        ignoreRestSiblings: true,
        destructuredArrayIgnorePattern: '[A-Z]',
        caughtErrors: 'none'
      }
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    //Off check !boolean
    'no-extra-boolean-cast': 0,
    'prettier/prettier': [
      'warn',
      {
        arrowParens: 'always',
        semi: false,
        trailingComma: 'none',
        tabWidth: 2,
        endOfLine: 'auto',
        useTabs: false,
        singleQuote: true,
        printWidth: 120,
        jsxSingleQuote: true
      }
    ]
  }
}
