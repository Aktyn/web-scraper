import { defineConfig } from 'vitest/config'

export default defineConfig({
  esbuild: false,
  test: {
    environment: 'node',
    restoreMocks: true,
    mockReset: true,
    clearMocks: true,
    include: ['src/**/*.spec.ts'],
  },
})
