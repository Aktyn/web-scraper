/**
 * NOTE: ElectronToRendererMessage and RendererToElectronMessage keys must equal to its corresponding values and be written in camelCase
 */
import type { Account } from './account'
import type { PaginatedApiFunctionWithEncryptedData } from './common'

export enum ElectronToRendererMessage {
  dummyEventFromMain = 'dummyEventFromMain',
}

export enum RendererToElectronMessage {
  getAccounts = 'getAccounts',
}

export type ElectronApi = {
  [ElectronToRendererMessage.dummyEventFromMain]: (
    callback: (event: Event, value: number) => void,
  ) => void
  [RendererToElectronMessage.getAccounts]: PaginatedApiFunctionWithEncryptedData<Account, 'id'>
}
