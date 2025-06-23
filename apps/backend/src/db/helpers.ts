import { createRequire } from "node:module"

export function getDrizzleKitApi() {
  //@ts-expect-error temporary fix for drizzle-kit/api
  const require = createRequire(import.meta.url || __filename)

  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  return require("drizzle-kit/api") as typeof import("drizzle-kit/api")
}
