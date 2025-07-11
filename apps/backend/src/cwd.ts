import path from "path"
import sea from "node:sea"
import { IS_TEST_ENV } from "./test/is-test-env"

export function cwd() {
  if (IS_TEST_ENV) {
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
