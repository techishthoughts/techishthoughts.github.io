import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    ignores: [
      'dist/**',
      'static/**',
      'public/**',
      'node_modules/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
      'layouts/**',
      'archetypes/**',
      'content/**',
      'data/**',
      '**/*.html',
      '**/*.md',
      'resources/**'
    ]
  },
  js.configs.recommended,
  {
    files: ['assets/js/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        navigator: 'readonly',
        performance: 'readonly',
        React: 'readonly',
        SpeechSynthesisVoice: 'readonly',
        SpeechSynthesisUtterance: 'readonly',
        IntersectionObserver: 'readonly',
        IntersectionObserverCallback: 'readonly',
        IntersectionObserverInit: 'readonly',
        IntersectionObserverEntry: 'readonly',
        ResizeObserver: 'readonly',
        ResizeObserverCallback: 'readonly',
        ResizeObserverOptions: 'readonly',
        ResponseType: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        Element: 'readonly',
        Document: 'readonly',
        Storage: 'readonly',
        Headers: 'readonly',
        Blob: 'readonly',
        FormData: 'readonly',
        Response: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
            '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ]
    }
  },
  {
    files: ['*.config.{js,cjs,mjs}', 'scripts/**/*.{js,cjs,mjs}'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        require: 'readonly'
      }
    }
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/test/**/*'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        vitest: 'readonly',
        it: 'readonly'
      }
    }
  }
];
