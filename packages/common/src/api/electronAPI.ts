import type { ApiError, PaginatedApiFunction } from './common'
import type { ScraperJob, UpsertScraperJobSchema } from './scraper'
// import type {
//   Action,
//   ActionExecutionResult,
//   ActionStep,
//   DataSourceItem,
//   DataSourceStructure,
//   DataSourceValueQuery,
//   FlowExecutionResult,
//   FlowStep,
//   MapSiteError,
//   Procedure,
//   ProcedureExecutionResult,
//   Routine,
//   RoutineExecutionHistory,
//   RoutineExecutionResult,
//   ScraperExecutionFinishedSchema,
//   ScraperExecutionResultSchema,
//   ScraperExecutionStartSchema,
//   ScraperMode,
//   SiteInstructions,
//   SiteProcedures,
//   UpsertDataSourceItemSchema,
//   UpsertDataSourceStructureSchema,
//   UpsertRoutineSchema,
//   UpsertSiteInstructionsSchema,
//   ValueQuery,
// } from './scraper-deprecated'
import type { Site } from './site'
import type { UserSettings } from './user'
import type { WindowStateChange } from './window'

/**
 * NOTE: ElectronToRendererMessage and RendererToElectronMessage keys must equal to its corresponding values and be written in camelCase
 */
export enum ElectronToRendererMessage {
  windowStateChanged = 'windowStateChanged',

  siteInstructionsTestingSessionOpen = 'siteInstructionsTestingSessionOpen',
  siteInstructionsTestingSessionClosed = 'siteInstructionsTestingSessionClosed',
  // /** Start of entire routine chain execution */
  // routineExecutionStarted = 'routineExecutionStarted',
  // /** Result of single routine iteration */
  // routineExecutionResult = 'routineExecutionResult',
  // /** Result of entire routine chain execution */
  // routineExecutionFinished = 'routineExecutionFinished',
  // scraperExecutionStarted = 'scraperExecutionStarted',
  // scraperExecutionResult = 'scraperExecutionResult',
  // scraperExecutionFinished = 'scraperExecutionFinished',
  // requestManualDataForActionStep = 'requestManualDataForActionStep',
  // requestDataSourceItemIdForActionStep = 'requestDataSourceItemIdForActionStep',
}

export enum RendererToElectronMessage {
  changeWindowState = 'changeWindowState',

  getUserSettings = 'getUserSettings',
  setUserSetting = 'setUserSetting',

  // getDataSources = 'getDataSources',
  // deleteDataSource = 'deleteDataSource',
  // updateDataSource = 'updateDataSource',
  // createDataSource = 'createDataSource',

  // deleteDataSourceItem = 'deleteDataSourceItem',
  // updateDataSourceItem = 'updateDataSourceItem',
  // createDataSourceItem = 'createDataSourceItem',
  // getDataSourceItems = 'getDataSourceItems',
  // clearDataSourceItems = 'clearDataSourceItems',
  // exportDataSourceItems = 'exportDataSourceItems',
  // importDataSourceItems = 'importDataSourceItems',

  // getSiteTags = 'getSiteTags',
  // deleteSiteTag = 'deleteSiteTag',
  // updateSiteTag = 'updateSiteTag',
  // createSiteTag = 'createSiteTag',
  // deleteLooseSiteTags = 'deleteLooseSiteTags',

  // getSites = 'getSites',
  // getSite = 'getSite',
  // createSite = 'createSite',
  // deleteSite = 'deleteSite',
  // updateSite = 'updateSite',
  // getSitePreview = 'getSitePreview',

  // getSiteInstructions = 'getSiteInstructions',
  // setSiteInstructions = 'setSiteInstructions',
  // getProceduresGroupedBySite = 'getProceduresGroupedBySite',

  // getRoutines = 'getRoutines',
  // getRoutine = 'getRoutine',
  // createRoutine = 'createRoutine',
  // updateRoutine = 'updateRoutine',
  // deleteRoutine = 'deleteRoutine',
  // executeRoutine = 'executeRoutine',
  // getRoutineExecutionHistory = 'getRoutineExecutionHistory',

  getSiteInstructionsTestingSessions = 'getSiteInstructionsTestingSessions',
  startSiteInstructionsTestingSession = 'startSiteInstructionsTestingSession',
  endSiteInstructionsTestingSession = 'endSiteInstructionsTestingSession',
  pickElement = 'pickElement',
  cancelPickingElement = 'cancelPickingElement',
  // testActionStep = 'testActionStep',
  // testAction = 'testAction',
  // testFlow = 'testFlow',
  // testProcedure = 'testProcedure',
  // returnManualDataForActionStep = 'returnManualDataForActionStep',
  // returnDataSourceItemIdForActionStep = 'returnDataSourceItemIdForActionStep',

  //NOTE: above may be deprecated
  getScraperJobs = 'getScraperJobs',
  createScraperJob = 'createScraperJob',
  deleteScraperJob = 'deleteScraperJob',
  updateScraperJob = 'updateScraperJob',
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Event<Params extends object = {}> = {
  preventDefault: () => void
  readonly defaultPrevented: boolean
} & Params

export interface IpcRendererEventPolyfill extends Event {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ports: any[]

  sender: NodeJS.EventEmitter
}

type ElectronToRendererMessageBlueprint<Args extends unknown[]> = (
  callback: (event: IpcRendererEventPolyfill, ...args: Args) => void,
) => void
// type ElectronToRendererMessageWithResponseRequestBlueprint<Args extends unknown[]> =
//   ElectronToRendererMessageBlueprint<[requestId: string, ...rest: Args]>
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

  // [ElectronToRendererMessage.routineExecutionStarted]: ElectronToRendererMessageBlueprint<
  //   [executionId: string, routine: Routine]
  // >
  // [ElectronToRendererMessage.routineExecutionResult]: ElectronToRendererMessageBlueprint<
  //   [executionId: string, result: RoutineExecutionResult]
  // >
  // [ElectronToRendererMessage.routineExecutionFinished]: ElectronToRendererMessageBlueprint<
  //   [executionId: string]
  // >

  // [ElectronToRendererMessage.scraperExecutionStarted]: ElectronToRendererMessageBlueprint<
  //   [
  //     scraperId: string,
  //     scraperMode: ScraperMode,
  //     executionId: string,
  //     data: ScraperExecutionStartSchema,
  //   ]
  // >
  // [ElectronToRendererMessage.scraperExecutionResult]: ElectronToRendererMessageBlueprint<
  //   [
  //     scraperId: string,
  //     scraperMode: ScraperMode,
  //     executionId: string,
  //     data: ScraperExecutionResultSchema,
  //   ]
  // >
  // [ElectronToRendererMessage.scraperExecutionFinished]: ElectronToRendererMessageBlueprint<
  //   [
  //     scraperId: string,
  //     scraperMode: ScraperMode,
  //     executionId: string,
  //     data: ScraperExecutionFinishedSchema,
  //   ]
  // >
  // [ElectronToRendererMessage.requestManualDataForActionStep]: ElectronToRendererMessageWithResponseRequestBlueprint<
  //   [actionStep: ActionStep, valueQuery: ValueQuery]
  // >
  // [ElectronToRendererMessage.requestDataSourceItemIdForActionStep]: ElectronToRendererMessageWithResponseRequestBlueprint<
  //   [actionStep: ActionStep, dataSourceValueQuery: DataSourceValueQuery]
  // >

  [RendererToElectronMessage.changeWindowState]: (
    stateChange: WindowStateChange,
  ) => Promise<ApiError>
  [RendererToElectronMessage.getUserSettings]: () => Promise<UserSettings | ApiError>
  [RendererToElectronMessage.setUserSetting]: <KeyType extends keyof UserSettings>(
    key: KeyType,
    value: UserSettings[KeyType],
  ) => Promise<ApiError>

  // [RendererToElectronMessage.getDataSources]: () => Promise<DataSourceStructure[] | ApiError>
  // [RendererToElectronMessage.deleteDataSource]: (
  //   dataSourceName: DataSourceStructure['name'],
  // ) => Promise<ApiError>
  // [RendererToElectronMessage.updateDataSource]: (
  //   originalDataSourceName: DataSourceStructure['name'],
  //   data: UpsertDataSourceStructureSchema,
  // ) => Promise<DataSourceStructure | ApiError>
  // [RendererToElectronMessage.createDataSource]: (
  //   data: UpsertDataSourceStructureSchema,
  // ) => Promise<DataSourceStructure | ApiError>

  // [RendererToElectronMessage.deleteDataSourceItem]: (
  //   dataSourceName: DataSourceStructure['name'],
  //   itemId: DataSourceItem['id'],
  // ) => Promise<ApiError>
  // [RendererToElectronMessage.updateDataSourceItem]: (
  //   dataSourceName: DataSourceStructure['name'],
  //   itemId: DataSourceItem['id'],
  //   data: UpsertDataSourceItemSchema,
  // ) => Promise<DataSourceItem | ApiError>
  // [RendererToElectronMessage.createDataSourceItem]: (
  //   dataSourceName: DataSourceStructure['name'],
  //   data: UpsertDataSourceItemSchema,
  // ) => Promise<ApiError>
  // [RendererToElectronMessage.getDataSourceItems]: PaginatedApiFunction<
  //   DataSourceItem,
  //   'id',
  //   never,
  //   [dataSourceName: string]
  // >
  // [RendererToElectronMessage.clearDataSourceItems]: (
  //   dataSourceName: DataSourceStructure['name'],
  // ) => Promise<ApiError>
  // [RendererToElectronMessage.exportDataSourceItems]: (
  //   dataSourceName: DataSourceStructure['name'],
  // ) => Promise<{ exportedRowsCount: number } | ApiError>
  // [RendererToElectronMessage.importDataSourceItems]: (
  //   dataSourceName: DataSourceStructure['name'],
  //   //TODO: option for ignoring id column
  // ) => Promise<{ importedRowsCount: number; failedRowsCount: number } | ApiError>

  // [RendererToElectronMessage.getSiteTags]: PaginatedApiFunction<SiteTag, 'id'>
  // [RendererToElectronMessage.deleteSiteTag]: (siteTagId: SiteTag['id']) => Promise<ApiError>
  // [RendererToElectronMessage.updateSiteTag]: (
  //   siteTagId: SiteTag['id'],
  //   data: UpsertSiteTagSchema,
  // ) => Promise<SiteTag | ApiError>
  // [RendererToElectronMessage.createSiteTag]: (
  //   data: UpsertSiteTagSchema,
  // ) => Promise<SiteTag | ApiError>
  // [RendererToElectronMessage.deleteLooseSiteTags]: () => Promise<
  //   { deletedCount: number } | ApiError
  // >

  // [RendererToElectronMessage.getSites]: PaginatedApiFunction<Site, 'id'>
  // [RendererToElectronMessage.getSite]: (siteId: Site['id']) => Promise<Site | ApiError>
  // [RendererToElectronMessage.createSite]: (data: UpsertSiteSchema) => Promise<Site | ApiError>
  // [RendererToElectronMessage.deleteSite]: (siteId: Site['id']) => Promise<ApiError>
  // [RendererToElectronMessage.updateSite]: (
  //   siteId: Site['id'],
  //   data: UpsertSiteSchema,
  // ) => Promise<Site | ApiError>
  // [RendererToElectronMessage.getSitePreview]: (
  //   url: string,
  // ) => Promise<{ imageBase64: string } | ApiError>

  // [RendererToElectronMessage.getSiteInstructions]: (
  //   siteId: Site['id'],
  // ) => Promise<SiteInstructions | ApiError>
  // [RendererToElectronMessage.setSiteInstructions]: (
  //   siteId: Site['id'],
  //   data: UpsertSiteInstructionsSchema,
  // ) => Promise<ApiError>
  // [RendererToElectronMessage.getProceduresGroupedBySite]: () => Promise<SiteProcedures[] | ApiError>

  // [RendererToElectronMessage.getRoutines]: () => Promise<Pick<Routine, 'id' | 'name'>[] | ApiError>
  // [RendererToElectronMessage.getRoutine]: (routineId: Routine['id']) => Promise<Routine | ApiError>
  // [RendererToElectronMessage.createRoutine]: (
  //   data: UpsertRoutineSchema,
  // ) => Promise<Routine | ApiError>
  // [RendererToElectronMessage.updateRoutine]: (
  //   routineId: Routine['id'],
  //   data: UpsertRoutineSchema,
  // ) => Promise<Routine | ApiError>
  // [RendererToElectronMessage.deleteRoutine]: (routineId: Routine['id']) => Promise<ApiError>
  // [RendererToElectronMessage.executeRoutine]: (
  //   routineId: Routine['id'],
  //   preview: boolean,
  // ) => Promise<{ executionId: string } | ApiError>
  // [RendererToElectronMessage.getRoutineExecutionHistory]: PaginatedApiFunction<
  //   RoutineExecutionHistory[number],
  //   'id'
  // >

  [RendererToElectronMessage.getSiteInstructionsTestingSessions]: () => Promise<
    { sessionId: string; site: Site }[] | ApiError
  >
  [RendererToElectronMessage.startSiteInstructionsTestingSession]: (
    siteId: Site['id'],
  ) => Promise<{ sessionId: string } | ApiError>
  [RendererToElectronMessage.endSiteInstructionsTestingSession]: (
    sessionId: string,
  ) => Promise<ApiError>
  [RendererToElectronMessage.pickElement]: (
    sessionId: string,
  ) => Promise<{ jsPath: string | null } | ApiError>
  [RendererToElectronMessage.cancelPickingElement]: (sessionId: string) => Promise<ApiError>
  // [RendererToElectronMessage.testActionStep]: (
  //   sessionId: string,
  //   actionStep: ActionStep,
  // ) => Promise<MapSiteError | ApiError>
  // [RendererToElectronMessage.testAction]: (
  //   sessionId: string,
  //   action: Action,
  // ) => Promise<ActionExecutionResult | ApiError>
  // [RendererToElectronMessage.testFlow]: (
  //   sessionId: string,
  //   flow: FlowStep,
  //   actions: Action[],
  // ) => Promise<FlowExecutionResult | ApiError>
  // [RendererToElectronMessage.testProcedure]: (
  //   sessionId: string,
  //   procedure: Procedure,
  //   actions: Action[],
  // ) => Promise<ProcedureExecutionResult | ApiError>
  // [RendererToElectronMessage.returnManualDataForActionStep]: RendererToElectronResponseBlueprint<
  //   ElectronToRendererMessage.requestManualDataForActionStep,
  //   [value: string | number | null]
  // >
  // [RendererToElectronMessage.returnDataSourceItemIdForActionStep]: RendererToElectronResponseBlueprint<
  //   ElectronToRendererMessage.requestDataSourceItemIdForActionStep,
  //   [itemId: DataSourceItem['id']]
  // >
  [RendererToElectronMessage.getScraperJobs]: PaginatedApiFunction<ScraperJob, 'id'>
  [RendererToElectronMessage.createScraperJob]: (
    data: UpsertScraperJobSchema,
  ) => Promise<ScraperJob | ApiError>
  [RendererToElectronMessage.updateScraperJob]: (
    scraperJobId: ScraperJob['id'],
    data: UpsertScraperJobSchema,
  ) => Promise<ScraperJob | ApiError>
  [RendererToElectronMessage.deleteScraperJob]: (
    scraperJobId: ScraperJob['id'],
  ) => Promise<ApiError>
}
