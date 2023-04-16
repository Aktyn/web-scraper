import type { Account, UpsertAccountSchema } from './account'
import type {
  ApiError,
  PaginatedApiFunction,
  PaginatedApiFunctionWithEncryptedData,
} from './common'
import type { Site, SiteTag, UpsertSiteSchema, UpsertSiteTagSchema } from './site'
import type { SiteInstructions, UpsertSiteInstructionsSchema } from './siteInstructions'
import type { UserSettings } from './user'

/**
 * NOTE: ElectronToRendererMessage and RendererToElectronMessage keys must equal to its corresponding values and be written in camelCase
 */
export enum ElectronToRendererMessage {
  dummyEventFromMain = 'dummyEventFromMain',
}

export enum RendererToElectronMessage {
  getUserSettings = 'getUserSettings',
  setUserSetting = 'setUserSetting',

  getAccounts = 'getAccounts',
  createAccount = 'createAccount',
  deleteAccount = 'deleteAccount',
  updateAccount = 'updateAccount',

  getSiteTags = 'getSiteTags',
  deleteSiteTag = 'deleteSiteTag',
  updateSiteTag = 'updateSiteTag',
  createSiteTag = 'createSiteTag',
  deleteLooseSiteTags = 'deleteLooseSiteTags',

  getSites = 'getSites',
  getSite = 'getSite',
  createSite = 'createSite',
  deleteSite = 'deleteSite',
  updateSite = 'updateSite',
  getSitePreview = 'getSitePreview',

  getSiteInstructions = 'getSiteInstructions',
  setSiteInstructions = 'setSiteInstructions',
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
  [RendererToElectronMessage.createAccount]: (
    data: UpsertAccountSchema,
    password: string,
  ) => Promise<Account | ApiError>
  [RendererToElectronMessage.deleteAccount]: (accountId: Account['id']) => Promise<ApiError>
  [RendererToElectronMessage.updateAccount]: (
    accountId: Account['id'],
    data: UpsertAccountSchema,
    password: string,
  ) => Promise<Account | ApiError>

  [RendererToElectronMessage.getSiteTags]: PaginatedApiFunction<SiteTag, 'id'>
  [RendererToElectronMessage.deleteSiteTag]: (siteTagId: SiteTag['id']) => Promise<ApiError>
  [RendererToElectronMessage.updateSiteTag]: (
    siteTagId: SiteTag['id'],
    data: UpsertSiteTagSchema,
  ) => Promise<SiteTag | ApiError>
  [RendererToElectronMessage.createSiteTag]: (
    data: UpsertSiteTagSchema,
  ) => Promise<SiteTag | ApiError>
  [RendererToElectronMessage.deleteLooseSiteTags]: () => Promise<
    { deletedCount: number } | ApiError
  >

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

  [RendererToElectronMessage.getSiteInstructions]: (
    siteId: Site['id'],
  ) => Promise<SiteInstructions | ApiError>
  [RendererToElectronMessage.setSiteInstructions]: (
    siteId: Site['id'],
    data: UpsertSiteInstructionsSchema,
  ) => Promise<ApiError>
}
