import { createContext, type Dispatch, type SetStateAction } from 'react'

const noop = () => {
  // do nothing
}

export const defaultUserSettings = {
  tablesCompactMode: false as boolean,
} satisfies Record<string, number | string | boolean>

export type UserSettingsSchema = typeof defaultUserSettings

export const UserDataContext = createContext({
  dataEncryptionPassword: null as string | null,
  setDataEncryptionPassword: noop as Dispatch<SetStateAction<string | null>>,
  settings: defaultUserSettings,
  updateSetting: noop as <KeyType extends keyof UserSettingsSchema>(
    key: KeyType,
    value: UserSettingsSchema[KeyType],
  ) => void,
})
