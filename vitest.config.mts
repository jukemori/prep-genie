import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment
    environment: 'happy-dom',
    globals: true,

    // Setup
    setupFiles: ['./tests/setup.ts'],

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'lib/**/*.{ts,tsx}',
        'features/**/*.{ts,tsx}',
        'components/**/*.{tsx}',
        'stores/**/*.ts',
      ],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.*',
        '.next/',
        'types/database.ts', // Auto-generated
        '**/*.d.ts',
        '**/index.ts', // Re-exports
        'app/**/*', // Pages/layouts (E2E test coverage)
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },

    // Execution
    pool: 'forks',
    fileParallelism: true,
    testTimeout: 10000,
    hookTimeout: 10000,

    // Mocking
    clearMocks: true,
    restoreMocks: true,

    // Reporters
    reporters: ['default'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
