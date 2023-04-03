import { type PropsWithChildren, useCallback, useEffect, useState } from 'react'
import type { UserSettings } from '@web-scraper/common'
import { defaultUserSettings, UserDataContext } from '../context/userDataContext'
import { useApiRequest } from '../hooks/useApiRequest'

export const UserDataProvider = ({ children }: PropsWithChildren) => {
  const getUserSettingsRequest = useApiRequest(window.electronAPI.getUserSettings)
  const setUserSettingsRequest = useApiRequest(window.electronAPI.setUserSetting)

  const [dataEncryptionPassword, setDataEncryptionPassword] = useState<string | null>(
    process.env.REACT_APP_ENCRYPTION_PASSWORD ?? null,
  )
  const [settings, setSettings] = useState(defaultUserSettings)

  useEffect(() => {
    getUserSettingsRequest.submit({
      onSuccess: setSettings,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateSetting = useCallback<
    <KeyType extends keyof UserSettings>(key: KeyType, value: UserSettings[KeyType]) => void
  >(
    (key, value) => {
      setSettings((prev) => ({ ...prev, [key]: value }))
      setUserSettingsRequest.submit({}, key, value)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <UserDataContext.Provider
      value={{ dataEncryptionPassword, setDataEncryptionPassword, settings, updateSetting }}
    >
      {children}
    </UserDataContext.Provider>
  )
}
