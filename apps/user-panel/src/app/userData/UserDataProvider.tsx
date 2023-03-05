import { useCallback, useEffect, useState, type PropsWithChildren } from 'react'
import { ErrorCode } from '@web-scrapper/common'
import type { UserSettings } from '@web-scrapper/common'
import { defaultUserSettings, UserDataContext } from '../context/userDataContext'
import { useCancellablePromise } from '../hooks/useCancellablePromise'

export const UserDataProvider = ({ children }: PropsWithChildren) => {
  const cancellable = useCancellablePromise()

  const [dataEncryptionPassword, setDataEncryptionPassword] = useState<string | null>(
    process.env.REACT_APP_ENCRYPTION_PASSWORD ?? null,
  )
  const [settings, setSettings] = useState(defaultUserSettings)

  useEffect(() => {
    cancellable(window.electronAPI.getUserSettings())
      .then((settings) => {
        if ('errorCode' in settings) {
          //TODO: handle error
          console.error('Failed to get user settings', settings)
          return
        }
        setSettings(settings)
      })
      .catch((error) => error && console.error(error))
  }, [cancellable])

  const updateSetting = useCallback<
    <KeyType extends keyof UserSettings>(key: KeyType, value: UserSettings[KeyType]) => void
  >(
    (key, value) => {
      setSettings((prev) => ({ ...prev, [key]: value }))

      cancellable(window.electronAPI.setUserSetting(key, value))
        .then((response) => {
          if (response.errorCode !== ErrorCode.NO_ERROR) {
            //TODO: handle response error
          }
        })
        .catch((error) => error && console.error(error))
    },
    [cancellable],
  )

  return (
    <UserDataContext.Provider
      value={{ dataEncryptionPassword, setDataEncryptionPassword, settings, updateSetting }}
    >
      {children}
    </UserDataContext.Provider>
  )
}
