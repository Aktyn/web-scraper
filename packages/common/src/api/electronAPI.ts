import type { Account, UpsertAccountSchema } from './account'
import type {
  ApiError,
  PaginatedApiFunction,
  PaginatedApiFunctionWithEncryptedData,
} from './common'
import type { Site, SiteTag, UpsertSiteSchema, UpsertSiteTagSchema } from './site'
import type {
  Action,
  ActionExecutionResult,
  ActionStep,
  FlowExecutionResult,
  FlowStep,
  MapSiteError,
  Procedure,
  ProcedureExecutionResult,
  SiteInstructions,
  UpsertSiteInstructionsSchema,
} from './scraper'
import type { UserSettings } from './user'

/**
 * NOTE: ElectronToRendererMessage and RendererToElectronMessage keys must equal to its corresponding values and be written in camelCase
 */
export enum ElectronToRendererMessage {
  siteInstructionsTestingSessionOpen = 'siteInstructionsTestingSessionOpen',
  siteInstructionsTestingSessionClosed = 'siteInstructionsTestingSessionClosed',
  requestManualDataForActionStep = 'requestManualDataForActionStep',
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

  getSiteInstructionsTestingSessions = 'getSiteInstructionsTestingSessions',
  startSiteInstructionsTestingSession = 'startSiteInstructionsTestingSession',
  endSiteInstructionsTestingSession = 'endSiteInstructionsTestingSession',
  testActionStep = 'testActionStep',
  testAction = 'testAction',
  testFlow = 'testFlow',
  testProcedure = 'testProcedure',
  returnManualDataForActionStep = 'returnManualDataForActionStep',
}

// eslint-disable-next-line @typescript-eslint/ban-types
type Event<Params extends object = {}> = {
  preventDefault: () => void
  readonly defaultPrevented: boolean
} & Params

export interface IpcRendererEventPolyfill extends Event {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ports: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sender: any
  senderId: number
}

type ElectronToRendererMessageBlueprint<Args extends unknown[]> = (
  callback: (event: IpcRendererEventPolyfill, ...args: Args) => void,
) => void
type ElectronToRendererMessageWithResponseRequestBlueprint<Args extends unknown[]> =
  ElectronToRendererMessageBlueprint<[requestId: string, ...rest: Args]>
export type RendererToElectronResponseBlueprint<
  OriginMessageType extends ElectronToRendererMessage,
  Args extends unknown[],
> = (originMessage: OriginMessageType, requestId: string, ...args: Args) => Promise<ApiError>

export type ElectronApi = {
  [ElectronToRendererMessage.siteInstructionsTestingSessionOpen]: ElectronToRendererMessageBlueprint<
    [sessionId: string, site: Site]
  >
  [ElectronToRendererMessage.siteInstructionsTestingSessionClosed]: ElectronToRendererMessageBlueprint<
    [sessionId: string]
  >
  [ElectronToRendererMessage.requestManualDataForActionStep]: ElectronToRendererMessageWithResponseRequestBlueprint<
    [actionStep: ActionStep, valueQuery: string]
  >

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

  [RendererToElectronMessage.getSiteInstructionsTestingSessions]: () => Promise<
    { sessionId: string; site: Site }[] | ApiError
  >
  [RendererToElectronMessage.startSiteInstructionsTestingSession]: (
    siteId: Site['id'],
  ) => Promise<{ sessionId: string } | ApiError>
  [RendererToElectronMessage.endSiteInstructionsTestingSession]: (
    sessionId: string,
  ) => Promise<ApiError>
  [RendererToElectronMessage.testActionStep]: (
    sessionId: string,
    actionStep: ActionStep,
  ) => Promise<MapSiteError | ApiError>
  [RendererToElectronMessage.testAction]: (
    sessionId: string,
    action: Action,
  ) => Promise<ActionExecutionResult | ApiError>
  [RendererToElectronMessage.testFlow]: (
    sessionId: string,
    flow: FlowStep,
    actions: Action[],
  ) => Promise<FlowExecutionResult | ApiError>
  [RendererToElectronMessage.testProcedure]: (
    sessionId: string,
    procedure: Procedure,
    actions: Action[],
  ) => Promise<ProcedureExecutionResult | ApiError>
  [RendererToElectronMessage.returnManualDataForActionStep]: RendererToElectronResponseBlueprint<
    ElectronToRendererMessage.requestManualDataForActionStep,
    [value: string]
  >
}
