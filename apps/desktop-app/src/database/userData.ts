import type { UserSettings } from '@web-scraper/common'

import Database from './index'

export function setUserSetting<KeyType extends keyof UserSettings>(
  key: KeyType,
  value: UserSettings[KeyType],
) {
  const stringifiedValue = JSON.stringify(value)

  return Database.prisma.userData.upsert({
    where: { key },
    update: { value: stringifiedValue },
    create: { key, value: stringifiedValue },
  })
}

export function getUserSettings() {
  return Database.prisma.userData.findMany({
    take: 1024,
    select: {
      key: true,
      value: true,
    },
  })
}
