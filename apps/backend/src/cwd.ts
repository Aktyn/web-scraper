import path from "path"

export function cwd() {
  if ("__dirname" in globalThis) {
    return path.join(globalThis["__dirname"], "..")
  } else {
    globalThis["__dirname"] = process.cwd()
  }

  return path.resolve(process.cwd())
}
