import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    setupFiles: [],
    exclude: ["node_modules", "dist"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "html"],
    },
  },
})
