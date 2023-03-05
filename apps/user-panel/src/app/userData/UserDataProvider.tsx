import type { PropsWithChildren } from 'react'
import { useCallback, useState } from 'react'
import {
  defaultUserSettings,
  UserDataContext,
  type UserSettingsSchema,
} from '../context/userDataContext'

export const UserDataProvider = ({ children }: PropsWithChildren) => {
  const [dataEncryptionPassword, setDataEncryptionPassword] = useState<string | null>(
    process.env.REACT_APP_ENCRYPTION_PASSWORD ?? null,
  )
  const [settings, setSettings] = useState(defaultUserSettings)

  //TODO: sync with local database

  const updateSetting = useCallback<
    <KeyType extends keyof UserSettingsSchema>(
      key: KeyType,
      value: UserSettingsSchema[KeyType],
    ) => void
  >((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }, [])

  return (
    <UserDataContext.Provider
      value={{ dataEncryptionPassword, setDataEncryptionPassword, settings, updateSetting }}
    >
      {children}
    </UserDataContext.Provider>
  )
}
