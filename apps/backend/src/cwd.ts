import path from "path"
import sea from "node:sea"

export function cwd() {
  if (
    process.env.TEST === "true" ||
    process.env.VITEST === "true" ||
    process.env.CI === "true"
  ) {
    return path.join(__dirname, "..")
  }

  if ("__dirname" in globalThis) {
    if (sea.isSea()) {
      return __dirname
    }
    return path.join(globalThis["__dirname"], "..")
  } else {
    globalThis["__dirname"] = process.cwd()
  }

  return path.resolve(process.cwd())
}
