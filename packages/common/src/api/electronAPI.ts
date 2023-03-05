/**
 * NOTE: ElectronToRendererMessage and RendererToElectronMessage keys must equal to its corresponding values and be written in camelCase
 */
import type { Account } from './account'
import type { ApiError, PaginatedApiFunctionWithEncryptedData } from './common'
import type { UserSettings } from './user'

export enum ElectronToRendererMessage {
  dummyEventFromMain = 'dummyEventFromMain',
}

export enum RendererToElectronMessage {
  getAccounts = 'getAccounts',
  getUserSettings = 'getUserSettings',
  setUserSetting = 'setUserSetting',
}

export type ElectronApi = {
  [ElectronToRendererMessage.dummyEventFromMain]: (
    callback: (event: Event, value: number) => void,
  ) => void
  [RendererToElectronMessage.getAccounts]: PaginatedApiFunctionWithEncryptedData<Account, 'id'>
  [RendererToElectronMessage.getUserSettings]: () => Promise<UserSettings | ApiError>
  [RendererToElectronMessage.setUserSetting]: <KeyType extends keyof UserSettings>(
    key: KeyType,
    value: UserSettings[KeyType],
  ) => Promise<ApiError>
}
