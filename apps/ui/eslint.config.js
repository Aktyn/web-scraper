import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-plugin-prettier'
import eslintConfigPrettier from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import typescriptEslint from 'typescript-eslint'
import reactCompiler from 'eslint-plugin-react-compiler'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'vite.config.ts'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, eslintConfigPrettier],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: typescriptEslint.parser,
      parserOptions: {
        project: 'tsconfig.app.json',
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier: prettier,
      import: importPlugin,
      '@typescript-eslint': typescriptEslint.plugin,
      'react-compiler': reactCompiler,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'prettier/prettier': 'error',
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-use-before-define': [
        'error',
        {
          functions: false,
          classes: true,
          variables: false,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          modifiers: ['const', 'destructured', 'global'],
          format: ['strictCamelCase'],
        },
        {
          selector: 'variable',
          modifiers: ['exported'],
          types: ['boolean', 'string', 'number', 'array'],
          format: ['UPPER_CASE'],
        },
        {
          selector: 'function',
          format: ['strictCamelCase', 'StrictPascalCase'],
        },
        {
          selector: ['class', 'interface', 'typeAlias'],
          format: ['StrictPascalCase'],
        },
        {
          selector: 'typeParameter',
          format: ['PascalCase'],
        },
      ],
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error', 'info'],
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      'import/no-duplicates': [
        'error',
        {
          'prefer-inline': true,
        },
      ],
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'react-compiler/react-compiler': 'error',
    },
  },
)
