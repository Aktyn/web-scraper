import { defaultPreferences } from "@web-scraper/common"
import type { DbModule } from "../db/db.module"
import { preferencesTable } from "../db/schema"

export async function getConfig(dbModule: DbModule) {
  let preferences = getDefaultPreferences()

  const updatePreferences = <Key extends keyof typeof preferences>(
    key: Key,
    value: (typeof preferences)[Key],
  ) => {
    preferences[key] = value
  }

  const resetPreferences = () => {
    preferences = getDefaultPreferences()
  }

  const userPreferences = await dbModule.db.select().from(preferencesTable)
  for (const preference of userPreferences) {
    updatePreferences(preference.key, preference.value as never)
  }

  return {
    apiPort: process.env.API_PORT ? parseInt(process.env.API_PORT) : 3001,
    preferences,
    updatePreferences,
    resetPreferences,
  }
}

export type Config = Awaited<ReturnType<typeof getConfig>>

export function getDefaultPreferences() {
  return Object.fromEntries(
    Object.entries(defaultPreferences).map(([key, { value }]) => [key, value]),
  ) as {
    [key in keyof typeof defaultPreferences]: (typeof defaultPreferences)[key]["value"]
  }
}
