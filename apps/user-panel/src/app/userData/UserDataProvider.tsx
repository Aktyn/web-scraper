import { type PropsWithChildren, useCallback, useEffect, useState } from 'react'
import type { UserSettings } from '@web-scrapper/common'
import { ErrorCode } from '@web-scrapper/common'
import { useSnackbar } from 'notistack'
import { defaultUserSettings, UserDataContext } from '../context/userDataContext'
import { useCancellablePromise } from '../hooks/useCancellablePromise'
import { errorMessages } from '../utils'

export const UserDataProvider = ({ children }: PropsWithChildren) => {
  const cancellable = useCancellablePromise()
  const { enqueueSnackbar } = useSnackbar()

  const [dataEncryptionPassword, setDataEncryptionPassword] = useState<string | null>(
    process.env.REACT_APP_ENCRYPTION_PASSWORD ?? null,
  )
  const [settings, setSettings] = useState(defaultUserSettings)

  useEffect(() => {
    cancellable(window.electronAPI.getUserSettings())
      .then((settings) => {
        if ('errorCode' in settings) {
          enqueueSnackbar({ variant: 'error', message: errorMessages[settings.errorCode] })
          return
        }
        setSettings(settings)
      })
      .catch((error) => error && console.error(error))
  }, [cancellable, enqueueSnackbar])

  const updateSetting = useCallback<
    <KeyType extends keyof UserSettings>(key: KeyType, value: UserSettings[KeyType]) => void
  >(
    (key, value) => {
      setSettings((prev) => ({ ...prev, [key]: value }))

      cancellable(window.electronAPI.setUserSetting(key, value))
        .then((response) => {
          if (response.errorCode !== ErrorCode.NO_ERROR) {
            enqueueSnackbar({ variant: 'error', message: errorMessages[response.errorCode] })
          }
        })
        .catch((error) => error && console.error(error))
    },
    [cancellable, enqueueSnackbar],
  )

  return (
    <UserDataContext.Provider
      value={{ dataEncryptionPassword, setDataEncryptionPassword, settings, updateSetting }}
    >
      {children}
    </UserDataContext.Provider>
  )
}
