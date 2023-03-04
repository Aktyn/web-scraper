import type { PropsWithChildren } from 'react'
import { useState } from 'react'
import { UserSettingsContext } from '../context/userSettingsContext'

export const UserSettingsProvider = ({ children }: PropsWithChildren) => {
  const [dataEncryptionPassword, setDataEncryptionPassword] = useState<string | null>(
    process.env.REACT_APP_ENCRYPTION_PASSWORD ?? null,
  )

  return (
    <UserSettingsContext.Provider value={{ dataEncryptionPassword, setDataEncryptionPassword }}>
      {children}
    </UserSettingsContext.Provider>
  )
}
