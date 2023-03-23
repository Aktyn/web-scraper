import { createContext, type Dispatch, type SetStateAction } from 'react'
import type { UserSettings } from '@web-scraper/common'

const noop = () => {
  // do nothing
}

export const defaultUserSettings: UserSettings = {
  tablesCompactMode: false as boolean,
} satisfies Record<string, number | string | boolean>

export const UserDataContext = createContext({
  dataEncryptionPassword: null as string | null,
  setDataEncryptionPassword: noop as Dispatch<SetStateAction<string | null>>,
  settings: defaultUserSettings,
  updateSetting: noop as <KeyType extends keyof UserSettings>(
    key: KeyType,
    value: UserSettings[KeyType],
  ) => void,
})
