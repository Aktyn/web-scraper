/**
 * NOTE: ElectronToRendererMessage and RendererToElectronMessage keys must equal to its corresponding values and be written in camelCase
 */
import type { Account } from './account'
import type {
  ApiError,
  PaginatedApiFunction,
  PaginatedApiFunctionWithEncryptedData,
} from './common'
import type { Site, UpsertSiteSchema } from './site'
import type { UserSettings } from './user'

export enum ElectronToRendererMessage {
  dummyEventFromMain = 'dummyEventFromMain',
}

export enum RendererToElectronMessage {
  getUserSettings = 'getUserSettings',
  setUserSetting = 'setUserSetting',

  getAccounts = 'getAccounts',

  getSites = 'getSites',
  createSite = 'createSite',
  deleteSite = 'deleteSite',
  updateSite = 'updateSite',
  getSitePreview = 'getSitePreview',
}

export type ElectronApi = {
  [ElectronToRendererMessage.dummyEventFromMain]: (
    callback: (event: Event, value: number) => void,
  ) => void

  [RendererToElectronMessage.getUserSettings]: () => Promise<UserSettings | ApiError>
  [RendererToElectronMessage.setUserSetting]: <KeyType extends keyof UserSettings>(
    key: KeyType,
    value: UserSettings[KeyType],
  ) => Promise<ApiError>
  [RendererToElectronMessage.getAccounts]: PaginatedApiFunctionWithEncryptedData<Account, 'id'>
  [RendererToElectronMessage.getSites]: PaginatedApiFunction<Site, 'id'>
  [RendererToElectronMessage.createSite]: (data: UpsertSiteSchema) => Promise<Site | ApiError>
  [RendererToElectronMessage.deleteSite]: (siteId: Site['id']) => Promise<ApiError>
  [RendererToElectronMessage.updateSite]: (
    siteId: Site['id'],
    data: UpsertSiteSchema,
  ) => Promise<Site | ApiError>
  [RendererToElectronMessage.getSitePreview]: (
    url: string,
  ) => Promise<{ imageBase64: string } | ApiError>
}
