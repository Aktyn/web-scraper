/**
 * NOTE: ElectronToRendererMessage and RendererToElectronMessage keys must equal to its corresponding values and be written in camelCase
 */
import type { Account } from './account'
import type {
  ApiError,
  PaginatedApiFunction,
  PaginatedApiFunctionWithEncryptedData,
} from './common'
import type { Site, SiteTag, UpsertSiteSchema, UpsertSiteTagSchema } from './site'
import type { UserSettings } from './user'

export enum ElectronToRendererMessage {
  dummyEventFromMain = 'dummyEventFromMain',
}

export enum RendererToElectronMessage {
  getUserSettings = 'getUserSettings',
  setUserSetting = 'setUserSetting',

  getAccounts = 'getAccounts',

  getSiteTags = 'getSiteTags',
  deleteSiteTag = 'deleteSiteTag',
  updateSiteTag = 'updateSiteTag',
  createSiteTag = 'createSiteTag',

  getSites = 'getSites',
  getSite = 'getSite',
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

  [RendererToElectronMessage.getAccounts]: PaginatedApiFunctionWithEncryptedData<
    Account,
    'id',
    'loginOrEmail' | 'password' | 'additionalCredentialsData'
  >

  [RendererToElectronMessage.getSiteTags]: PaginatedApiFunction<SiteTag, 'id'>
  [RendererToElectronMessage.deleteSiteTag]: (siteTagId: SiteTag['id']) => Promise<ApiError>
  [RendererToElectronMessage.updateSiteTag]: (
    siteTagId: SiteTag['id'],
    data: UpsertSiteTagSchema,
  ) => Promise<SiteTag | ApiError>
  [RendererToElectronMessage.createSiteTag]: (
    data: UpsertSiteTagSchema,
  ) => Promise<SiteTag | ApiError>

  [RendererToElectronMessage.getSites]: PaginatedApiFunction<Site, 'id'>
  [RendererToElectronMessage.getSite]: (siteId: Site['id']) => Promise<Site | ApiError>
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
