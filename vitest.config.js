import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    clearMocks: true,
    testTimeout: 20000,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.js'],
      exclude: [
        ...configDefaults.exclude,
        'src/test-utils',
        'src/index.js',
        'src/client/javascripts/application.js',
        'src/client/javascripts/**/entry.js',
        'src/client/javascripts/onboarding/index.js',
        'src/config/nunjucks/filters/filters.js',
        'src/**/*.json',
        'src/server/common/plugins/index.js',
        'src/server/common/test-helpers',
        '.public',
        'coverage',
        'postcss.config.js',
        'stylelint.config.js'
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100
      }
    }
  }
})
