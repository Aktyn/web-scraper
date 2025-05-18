import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"
import tailwindcss from "@tailwindcss/vite"

const ReactCompilerConfig = {}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ["babel-plugin-react-compiler", ReactCompilerConfig],
          "@babel/plugin-proposal-explicit-resource-management",
        ],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    preserveSymlinks: true,
  },
  define: {
    global: "window",
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  test: {
    exclude: [],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "html"],
    },
  },
})
