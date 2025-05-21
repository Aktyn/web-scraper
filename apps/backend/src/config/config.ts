import { assert } from "@web-scraper/common"

export function getConfig() {
  const dbUrl = process.env.DB_FILE_NAME
  assert(!!dbUrl, "DB_FILE_NAME environment variable is not set")

  return {
    dbUrl,
    apiPort: process.env.API_PORT ? parseInt(process.env.API_PORT) : 3000,
  }
}

export type Config = ReturnType<typeof getConfig>
