import type { UserData as DatabaseUserData } from '@prisma/client'
import type { UserSettings } from '@web-scraper/common'

export function parseUserSettings(userData: DatabaseUserData[]): UserSettings {
  return userData.reduce((acc, { key, value }) => {
    acc[key as keyof UserSettings] = JSON.parse(value)
    return acc
  }, {} as UserSettings)
}
