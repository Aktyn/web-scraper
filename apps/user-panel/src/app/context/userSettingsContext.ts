import { createContext, type Dispatch, type SetStateAction } from 'react'

const noop = () => {
  // do nothing
}

export const UserSettingsContext = createContext({
  dataEncryptionPassword: null as string | null,
  setDataEncryptionPassword: noop as Dispatch<SetStateAction<string | null>>,
})
