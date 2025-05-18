import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    exclude: [],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "html"],
    },
  },
})
