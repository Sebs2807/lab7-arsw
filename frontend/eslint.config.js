// eslint.config.js (Flat Config para ESLint v9)
import globals from 'globals'
import pluginReact from 'eslint-plugin-react'

export default [
  // Ignorar carpetas de build y dependencias
  { ignores: ['dist/**', 'build/**', 'node_modules/**'] },

  // Reglas para el código de la app
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react: pluginReact },
    rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off', // React 17+ (Vite) no requiere import React
    },
    settings: { react: { version: 'detect' } },
  },

  // Reglas/escope para tests (Vitest + jsdom)
  {
    files: ['tests/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser, ...globals.vitest },
    },
  },
]
