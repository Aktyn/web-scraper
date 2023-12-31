import { type PropsWithChildren, useCallback, useEffect, useState } from 'react'
import type { UserSettings } from '@web-scraper/common'
import { defaultUserSettings, UserDataContext } from '../context/userDataContext'
import { useApiRequest } from '../hooks/useApiRequest'

export type UserDataProviderProps = PropsWithChildren<{
  onChange?: (userSettings: typeof defaultUserSettings, reason: 'loaded' | 'updated') => void
}>

export const UserDataProvider = ({ children, onChange }: UserDataProviderProps) => {
  const { submit: getUserSettingsRequest } = useApiRequest(window.electronAPI.getUserSettings)
  const { submit: setUserSettingsRequest } = useApiRequest(window.electronAPI.setUserSetting)

  const [dataEncryptionPassword, setDataEncryptionPassword] = useState<string | null>(
    process.env.REACT_APP_ENCRYPTION_PASSWORD ?? null,
  )
  const [settings, setSettings] = useState(defaultUserSettings)
  const [loadingSettings, setLoadingSettings] = useState(true)

  useEffect(() => {
    getUserSettingsRequest({
      onSuccess: (settings) => {
        onChange?.(settings, 'loaded')
        setSettings(settings)
      },
      onEnd: () => setLoadingSettings(false),
    })
  }, [getUserSettingsRequest, onChange])

  const updateSetting = useCallback<
    <KeyType extends keyof UserSettings>(key: KeyType, value: UserSettings[KeyType]) => void
  >(
    (key, value) => {
      setSettings((prev) => {
        const newSettings = { ...prev, [key]: value }
        onChange?.(newSettings, 'updated')
        return newSettings
      })
      setUserSettingsRequest({}, key, value)
    },
    [onChange, setUserSettingsRequest],
  )

  return (
    <UserDataContext.Provider
      value={{
        dataEncryptionPassword,
        setDataEncryptionPassword,
        settings,
        updateSetting,
        loading: loadingSettings,
      }}
    >
      {children}
    </UserDataContext.Provider>
  )
}
