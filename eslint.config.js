// eslint.config.mjs  – ESLint 9 flat config for a React (JS) project
import js from '@eslint/js' // core “eslint:recommended” rules
import ts from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import'
import stylistic from '@stylistic/eslint-plugin'
import globals from 'globals'
import { defineConfig, globalIgnores } from 'eslint/config' // for flat config support

export default defineConfig([
  /* 1️⃣  core JS rules */
  js.configs.recommended,
  ...ts.configs.recommended,
  stylistic.configs.recommended,

  /* 2️⃣  React-specific linting */
  {
    files: ['**/*.{js,jsx,ts,tsx,mts}'],

    /* plugin objects – NOT arrays */
    plugins: {
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'import': importPlugin,
      '@stylistic': stylistic,
    },

    /* modern JS + JSX parsing */
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        Spotify: 'readonly', // global for Spotify Web API
      },
    },

    /* React version autodetect */
    settings: { react: { version: 'detect' } },

    /* rules – start with each plugin’s recommended set, then tweak */
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,

      /* project-specific tweaks */
      'react/react-in-jsx-scope': 'off', // React ≥17
      'react-hooks/exhaustive-deps': 'off', // warn on missing dependencies in useEffect
      'react/prop-types': 'off', // enable if you use PropTypes
      'import/order': ['warn', { 'newlines-between': 'always' }],
      '@typescript-eslint/no-explicit-any': 'on', // warn on any type usage
      'no-var': 'off',
    },
  },
  globalIgnores(['**/node_modules/**', '**/dist/**', '**/renderer/**', '**/public/**', 'node_modules/']),
])
