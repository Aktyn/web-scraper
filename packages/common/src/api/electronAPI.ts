import type { ApiError, PaginatedApiFunction } from './common'
import type {
  DataSourceItem,
  DataSourceStructure,
  UpsertDataSourceItemSchema,
  UpsertDataSourceStructureSchema,
} from './dataSource'
import type {
  Action,
  ActionExecutionResult,
  ActionStep,
  DataSourceValueQuery,
  FlowExecutionResult,
  FlowStep,
  MapSiteError,
  Procedure,
  ProcedureExecutionResult,
  ScraperExecutionFinishedSchema,
  ScraperExecutionResultSchema,
  ScraperExecutionStartSchema,
  ScraperMode,
  SiteInstructions,
  UpsertSiteInstructionsSchema,
  ValueQuery,
} from './scraper'
import type { Site, SiteTag, UpsertSiteSchema, UpsertSiteTagSchema } from './site'
import type { UserSettings } from './user'
import type { WindowStateChange } from './window'

/**
 * NOTE: ElectronToRendererMessage and RendererToElectronMessage keys must equal to its corresponding values and be written in camelCase
 */
export enum ElectronToRendererMessage {
  windowStateChanged = 'windowStateChanged',

  siteInstructionsTestingSessionOpen = 'siteInstructionsTestingSessionOpen',
  siteInstructionsTestingSessionClosed = 'siteInstructionsTestingSessionClosed',
  scraperExecutionStarted = 'scraperExecutionStarted',
  scraperExecutionResult = 'scraperExecutionResult',
  scraperExecutionFinished = 'scraperExecutionFinished',
  requestManualDataForActionStep = 'requestManualDataForActionStep',
  requestDataSourceItemIdForActionStep = 'requestDataSourceItemIdForActionStep',
}

export enum RendererToElectronMessage {
  changeWindowState = 'changeWindowState',

  getUserSettings = 'getUserSettings',
  setUserSetting = 'setUserSetting',

  getDataSources = 'getDataSources',
  deleteDataSource = 'deleteDataSource',
  updateDataSource = 'updateDataSource',
  createDataSource = 'createDataSource',

  deleteDataSourceItem = 'deleteDataSourceItem',
  updateDataSourceItem = 'updateDataSourceItem',
  createDataSourceItem = 'createDataSourceItem',
  getDataSourceItems = 'getDataSourceItems',
  clearDataSourceItems = 'clearDataSourceItems',
  exportDataSourceItems = 'exportDataSourceItems',
  importDataSourceItems = 'importDataSourceItems',

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
  returnDataSourceItemIdForActionStep = 'returnDataSourceItemIdForActionStep',
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
  [ElectronToRendererMessage.windowStateChanged]: ElectronToRendererMessageBlueprint<
    [stateChange: WindowStateChange]
  >
  [ElectronToRendererMessage.siteInstructionsTestingSessionOpen]: ElectronToRendererMessageBlueprint<
    [sessionId: string, site: Site]
  >
  [ElectronToRendererMessage.siteInstructionsTestingSessionClosed]: ElectronToRendererMessageBlueprint<
    [sessionId: string]
  >
  [ElectronToRendererMessage.scraperExecutionStarted]: ElectronToRendererMessageBlueprint<
    [
      scraperId: string,
      scraperMode: ScraperMode,
      executionId: string,
      data: ScraperExecutionStartSchema,
    ]
  >
  [ElectronToRendererMessage.scraperExecutionResult]: ElectronToRendererMessageBlueprint<
    [
      scraperId: string,
      scraperMode: ScraperMode,
      executionId: string,
      data: ScraperExecutionResultSchema,
    ]
  >
  [ElectronToRendererMessage.scraperExecutionFinished]: ElectronToRendererMessageBlueprint<
    [
      scraperId: string,
      scraperMode: ScraperMode,
      executionId: string,
      data: ScraperExecutionFinishedSchema,
    ]
  >
  [ElectronToRendererMessage.requestManualDataForActionStep]: ElectronToRendererMessageWithResponseRequestBlueprint<
    [actionStep: ActionStep, valueQuery: ValueQuery]
  >
  [ElectronToRendererMessage.requestDataSourceItemIdForActionStep]: ElectronToRendererMessageWithResponseRequestBlueprint<
    [actionStep: ActionStep, dataSourceValueQuery: DataSourceValueQuery]
  >

  [RendererToElectronMessage.changeWindowState]: (
    stateChange: WindowStateChange,
  ) => Promise<ApiError>
  [RendererToElectronMessage.getUserSettings]: () => Promise<UserSettings | ApiError>
  [RendererToElectronMessage.setUserSetting]: <KeyType extends keyof UserSettings>(
    key: KeyType,
    value: UserSettings[KeyType],
  ) => Promise<ApiError>

  [RendererToElectronMessage.getDataSources]: () => Promise<DataSourceStructure[] | ApiError>
  [RendererToElectronMessage.deleteDataSource]: (
    dataSourceName: DataSourceStructure['name'],
  ) => Promise<ApiError>
  [RendererToElectronMessage.updateDataSource]: (
    originalDataSourceName: DataSourceStructure['name'],
    data: UpsertDataSourceStructureSchema,
  ) => Promise<DataSourceStructure | ApiError>
  [RendererToElectronMessage.createDataSource]: (
    data: UpsertDataSourceStructureSchema,
  ) => Promise<DataSourceStructure | ApiError>

  [RendererToElectronMessage.deleteDataSourceItem]: (
    dataSourceName: DataSourceStructure['name'],
    itemId: DataSourceItem['id'],
  ) => Promise<ApiError>
  [RendererToElectronMessage.updateDataSourceItem]: (
    dataSourceName: DataSourceStructure['name'],
    itemId: DataSourceItem['id'],
    data: UpsertDataSourceItemSchema,
  ) => Promise<DataSourceItem | ApiError>
  [RendererToElectronMessage.createDataSourceItem]: (
    dataSourceName: DataSourceStructure['name'],
    data: UpsertDataSourceItemSchema,
  ) => Promise<ApiError>
  [RendererToElectronMessage.getDataSourceItems]: PaginatedApiFunction<
    DataSourceItem,
    'id',
    never,
    [dataSourceName: string]
  >
  [RendererToElectronMessage.clearDataSourceItems]: (
    dataSourceName: DataSourceStructure['name'],
  ) => Promise<ApiError>
  [RendererToElectronMessage.exportDataSourceItems]: (
    dataSourceName: DataSourceStructure['name'],
  ) => Promise<{ exportedRowsCount: number } | ApiError>
  [RendererToElectronMessage.importDataSourceItems]: (
    dataSourceName: DataSourceStructure['name'],
    //TODO: option for ignoring id column
  ) => Promise<{ importedRowsCount: number; failedRowsCount: number } | ApiError>

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
    [value: string | number | null]
  >
  [RendererToElectronMessage.returnDataSourceItemIdForActionStep]: RendererToElectronResponseBlueprint<
    ElectronToRendererMessage.requestDataSourceItemIdForActionStep,
    [itemId: DataSourceItem['id']]
  >
}
