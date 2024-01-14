import {
  ActionStepErrorType,
  ActionStepType,
  ElectronToRendererMessage,
  GLOBAL_ACTION_PREFIX,
  GlobalActionType,
  isGlobalAction,
  isRegularAction,
  Logger,
  omit,
  REGULAR_ACTION_PREFIX,
  safePromise,
  ScraperExecutionScope,
  ScraperMode,
  sortNumbers,
  wait,
  waitFor,
  type Action,
  type ActionExecutionResult,
  type ActionStep,
  type FlowExecutionResult,
  type FlowStep,
  type MapSiteError,
  type Procedure,
  type ProcedureExecutionResult,
  type Routine,
  type Site,
  ErrorCode,
} from '@web-scraper/common'
import type { ElementHandle, Page } from 'puppeteer'
import { v4 as uuidV4 } from 'uuid'

import { broadcastMessage } from '../api/internal/helpers'
import { parseUserSettings } from '../api/internal/parsers/userSettingsParser'
import Database from '../database'

import {
  getFlowFinishedNotification,
  type RequestDataCallback,
  type RequestDataSourceItemIdCallback,
} from '.'
import ScraperBrowser from './scraperBrowser'
import type { ScraperPage } from './scraperPage'
import {
  checkErrorStep,
  checkSuccessStep,
  fillInputStep,
  pressButtonStep,
  selectOptionStep,
  waitForElementStep,
  waitStep,
} from './steps'
import { saveToDataSourceStep } from './steps/saveToDataSource.step'

type ScraperOptions<ModeType extends ScraperMode> = {
  onClose?: () => void
} & (ModeType extends ScraperMode.ROUTINE_EXECUTION
  ? {
      routine: Routine
      procedureActions: Map<Procedure['id'], Action[]>
      preview?: boolean
      // onResult: (result: RoutineExecutionResult) => void //TODO: remove (this is handled via ElectronToRendererMessage.scraperExecutionResult)
    }
  : ModeType extends ScraperMode.TESTING
    ? { siteId: Site['id']; lockURL: string }
    : ModeType extends ScraperMode.PREVIEW
      ? { viewportWidth: number; viewportHeight: number }
      : never)

export class Scraper<ModeType extends ScraperMode> {
  public static readonly Mode = ScraperMode

  private static readonly instancesStore: {
    [ModeKey in ScraperMode]: Map<string, Scraper<ModeKey>>
  } = {
    [ScraperMode.ROUTINE_EXECUTION]: new Map<string, Scraper<ScraperMode.ROUTINE_EXECUTION>>(),
    [ScraperMode.TESTING]: new Map<string, Scraper<ScraperMode.TESTING>>(),
    [ScraperMode.PREVIEW]: new Map<string, Scraper<ScraperMode.PREVIEW>>(),
  }
  public static getInstances<ModeKey extends ScraperMode>(mode: ModeKey) {
    return Scraper.instancesStore[mode]
  }
  public static getAllInstances() {
    return Object.values(Scraper.instancesStore).flatMap((map: Map<string, Scraper<ScraperMode>>) =>
      Array.from(map.values()),
    )
  }

  private destroyed = false
  public readonly id = uuidV4()
  protected readonly logger: Logger

  private readonly browser: ScraperBrowser
  protected mainPage: ScraperPage | null = null
  private readonly options: ScraperOptions<ModeType>
  private initialized = false

  constructor(
    mode: ScraperMode.ROUTINE_EXECUTION,
    options: ScraperOptions<ScraperMode.ROUTINE_EXECUTION>,
  )
  constructor(mode: ScraperMode.TESTING, options: ScraperOptions<ScraperMode.TESTING>)
  constructor(mode: ScraperMode.PREVIEW, options: ScraperOptions<ScraperMode.PREVIEW>)
  constructor(
    public readonly mode: ModeType,
    options: ScraperOptions<ModeType>,
  ) {
    this.options = options as never
    this.logger = new Logger(
      `[Scraper (mode: ${ScraperMode[this.mode]}) (id: ${this.id.substring(0, 8)})]`,
    )

    const headless =
      mode === ScraperMode.PREVIEW ||
      (mode === ScraperMode.ROUTINE_EXECUTION &&
        !(this.options as ScraperOptions<ScraperMode.ROUTINE_EXECUTION>).preview) ||
      process.env.JEST_WORKER_ID
        ? 'new'
        : false

    this.browser = new ScraperBrowser({
      headless,
      defaultViewport:
        mode === ScraperMode.PREVIEW
          ? {
              ...ScraperBrowser.defaultViewport,
              width: (this as Scraper<ScraperMode.PREVIEW>).options.viewportWidth,
              height: (this as Scraper<ScraperMode.PREVIEW>).options.viewportHeight,
            }
          : null,
      onBrowserClosed: async () => {
        await this.destroy(false)
        this.options?.onClose?.()
      },
    })

    Scraper.instancesStore[this.mode].set(this.id, this)

    this.logger.info(`Instance created`)

    this.init().catch((error) => this.logger.error(error))
  }

  async destroy(destroyBrowser = true) {
    this.destroyed = true
    Scraper.instancesStore[this.mode].delete(this.id)
    this.mainPage && (await safePromise(this.mainPage.destroy()))
    this.mainPage = null
    if (destroyBrowser) {
      await safePromise(this.browser.destroy())
    }
  }

  public getOptions() {
    return this.options as Readonly<ScraperOptions<ModeType>>
  }

  public async waitForInit(timeout = 10_000) {
    try {
      await waitFor(() => Promise.resolve(this.initialized), 100, timeout)
    } catch (error) {
      await this.destroy()
      throw { errorCode: ErrorCode.SCRAPER_INIT_ERROR, error }
    }
  }

  private async init() {
    if (this.mainPage) {
      this.logger.error('Main page has been already initialized')
      return
    }

    switch (this.mode) {
      case ScraperMode.ROUTINE_EXECUTION:
        await this.initRoutineExecutionMode()
        break
      case ScraperMode.TESTING:
        await this.initTestingMode()
        break
      case ScraperMode.PREVIEW:
        await this.initPreviewMode()
        break
    }
    this.initialized = true
  }

  private async initRoutineExecutionMode(self = this as Scraper<ScraperMode.ROUTINE_EXECUTION>) {
    self.mainPage = await this.browser.getFirstPage()
    await wait(100)
  }

  private async initTestingMode(self = this as Scraper<ScraperMode.TESTING>) {
    self.mainPage = await this.browser.getFirstPage()
    await self.mainPage!.goto(self.options.lockURL)

    const targetUrl = new URL(self.options.lockURL)

    self.mainPage!.on('close', async () => {
      if (this.destroyed) {
        return
      }
      await this.initTestingMode(self)
    })
    self.mainPage!.on('framenavigated', async (frame) => {
      const url = new URL(self.mainPage!.exposed.url())
      if (
        url.host &&
        url.host !== 'null' &&
        url.host !== targetUrl.host &&
        url.host.replace(/^[^.]+\./i, '') !== targetUrl.host
      ) {
        this.logger.info(
          `Returning to ${self.options.lockURL} due to manual redirecting to different host (${url.host})`,
        )
        await safePromise(frame.goto(self.options.lockURL))
      }
    })

    //Close any new page opened
    await this.browser.on('targetcreated', async (target) => {
      if (target.type() === 'page' && !this.destroyed) {
        const newPage: Page = await target.page()
        this.logger.info('Closing manually opened page in testing mode')
        await newPage.close()
      }
    })
  }

  private async initPreviewMode(self = this as Scraper<ScraperMode.PREVIEW>) {
    self.mainPage = await this.browser.getFirstPage()
  }

  public async takeScreenshot(url: string) {
    const page = await this.browser.newPage()
    await page.goto(url, null, { timeout: 30_000, waitUntil: 'networkidle0' })

    await wait(200)

    const imageData = await page.screenshot({
      type: 'webp',
      quality: 90,
      encoding: 'base64',
      fullPage: true,
    })

    await safePromise(page.close())

    return imageData
  }

  @assertMainPage
  public async performRoutineIteration(
    routine: Routine,
    _onDataRequest: RequestDataCallback,
    _onDataSourceItemIdRequest: RequestDataSourceItemIdCallback,
  ) {
    //TODO: check if procedure finishes with error and according to routine.stopOnError break the execution chain
    console.log('TODO: performRoutineIteration', routine.name)
  }

  @assertMainPage
  public async performProcedure(
    procedure: Procedure,
    actions: Action[],
    onDataRequest: RequestDataCallback,
    onDataSourceItemIdRequest: RequestDataSourceItemIdCallback,
  ): Promise<ProcedureExecutionResult> {
    const executionId = uuidV4()
    try {
      this.logger.info('Performing procedure:', procedure.type)
      broadcastMessage(
        ElectronToRendererMessage.scraperExecutionStarted,
        this.id,
        this.mode,
        executionId,
        {
          scope: ScraperExecutionScope.PROCEDURE,
          procedure,
        },
      )

      if (!procedure.flow) {
        throw new Error('Procedure flow is not defined')
      }

      try {
        if (new URL(this.mainPage!.exposed.url()).href !== new URL(procedure.startUrl).href) {
          await this.mainPage!.goto(procedure.startUrl, null, {
            timeout: 30_000,
            waitUntil: 'networkidle0',
          })
        }
      } catch (error) {
        this.logger.error(error)
      }

      if (procedure.waitFor) {
        const handle = await this.waitFor(procedure.waitFor)
        if (!handle) {
          broadcastMessage(
            ElectronToRendererMessage.scraperExecutionResult,
            this.id,
            this.mode,
            executionId,
            {
              scope: ScraperExecutionScope.PROCEDURE,
              procedureResult: { errorType: ActionStepErrorType.ELEMENT_NOT_FOUND },
            },
          )
          return {
            procedure,
            flowExecutionResult: { errorType: ActionStepErrorType.ELEMENT_NOT_FOUND },
          }
        }
      }

      const flowExecutionResult = await this.performFlow(
        procedure.flow,
        actions,
        onDataRequest,
        onDataSourceItemIdRequest,
      )

      broadcastMessage(
        ElectronToRendererMessage.scraperExecutionResult,
        this.id,
        this.mode,
        executionId,
        {
          scope: ScraperExecutionScope.PROCEDURE,
          procedureResult: flowExecutionResult,
        },
      )

      return {
        procedure,
        flowExecutionResult,
      }
    } finally {
      broadcastMessage(
        ElectronToRendererMessage.scraperExecutionFinished,
        this.id,
        this.mode,
        executionId,
        {
          scope: ScraperExecutionScope.PROCEDURE,
        },
      )
    }
  }

  @assertMainPage
  public async performFlow(
    flow: FlowStep,
    actions: Action[],
    onDataRequest: RequestDataCallback,
    onDataSourceItemIdRequest: RequestDataSourceItemIdCallback,
  ): Promise<FlowExecutionResult> {
    const executionId = uuidV4()
    try {
      this.logger.info('Performing flow starting with action:', flow.actionName)
      broadcastMessage(
        ElectronToRendererMessage.scraperExecutionStarted,
        this.id,
        this.mode,
        executionId,
        {
          scope: ScraperExecutionScope.FLOW,
          flow,
        },
      )

      const flowStepsResults: FlowExecutionResult['flowStepsResults'] = []

      if (isRegularAction(flow.actionName)) {
        const actionName = flow.actionName.substring(REGULAR_ACTION_PREFIX.length + 1)
        const action = actions.find((action) => action.name === actionName)
        if (!action) {
          throw new Error(`Action ${actionName} not found`)
        }

        const actionResult = await this.performAction(
          action,
          onDataRequest,
          onDataSourceItemIdRequest,
        )
        const actionSucceeded = actionResult.actionStepsResults.every(
          (stepResult) => stepResult.result.errorType === ActionStepErrorType.NO_ERROR,
        )

        flowStepsResults.push({
          flowStep: omit(flow, 'onSuccess', 'onFailure'),
          actionResult,
          returnedValues: [],
          succeeded: actionSucceeded,
        })

        if (actionSucceeded) {
          if (!flow.onSuccess) {
            throw new Error(`Flow ${flow.actionName} has no onSuccess flow`)
          }
          const successResult = await this.performFlow(
            flow.onSuccess,
            actions,
            onDataRequest,
            onDataSourceItemIdRequest,
          )
          flowStepsResults.push(...successResult.flowStepsResults)
        } else {
          if (!flow.onFailure) {
            throw new Error(`Flow ${flow.actionName} has no onFailure flow`)
          }
          const failureResult = await this.performFlow(
            flow.onFailure,
            actions,
            onDataRequest,
            onDataSourceItemIdRequest,
          )
          flowStepsResults.push(...failureResult.flowStepsResults)
        }
      } else if (isGlobalAction(flow.actionName)) {
        const globalAction = flow.actionName.substring(
          GLOBAL_ACTION_PREFIX.length + 1,
        ) as GlobalActionType

        flowStepsResults.push({
          flowStep: omit(flow, 'onSuccess', 'onFailure'),
          actionResult: null,
          returnedValues: await Promise.all(
            flow.globalReturnValues.map(async (selector) => {
              try {
                const elementSuccess = await this.waitFor(selector)
                if (!elementSuccess) {
                  return { error: 'Element not found' }
                }

                const text = await elementSuccess.evaluate((el) => el.textContent)
                if (text === null) {
                  return { error: 'Element has no text content' }
                }
                return text
              } catch (error) {
                return { error: error instanceof Error ? error.message : String(error) }
              }
            }),
          ),
          succeeded: globalAction !== GlobalActionType.FINISH_WITH_ERROR,
        })

        switch (globalAction) {
          case GlobalActionType.FINISH:
          case GlobalActionType.FINISH_WITH_ERROR:
            // noop
            break
          case GlobalActionType.FINISH_WITH_NOTIFICATION:
            {
              const userSettings = await Database.userData.getUserSettings().then(parseUserSettings)
              if (userSettings.desktopNotifications) {
                getFlowFinishedNotification().show()
              }
            }
            break
          default:
            throw new Error(`Invalid global action: ${globalAction}`)
        }
      } else {
        throw new Error(`Invalid action name: ${flow.actionName}`)
      }

      broadcastMessage(
        ElectronToRendererMessage.scraperExecutionResult,
        this.id,
        this.mode,
        executionId,
        {
          scope: ScraperExecutionScope.FLOW,
          flowResult: flowStepsResults,
        },
      )

      return {
        flow,
        flowStepsResults,
      }
    } finally {
      broadcastMessage(
        ElectronToRendererMessage.scraperExecutionFinished,
        this.id,
        this.mode,
        executionId,
        {
          scope: ScraperExecutionScope.FLOW,
        },
      )
    }
  }

  @assertMainPage
  public async performAction(
    action: Action,
    onDataRequest: RequestDataCallback,
    onDataSourceItemIdRequest: RequestDataSourceItemIdCallback,
  ): Promise<ActionExecutionResult> {
    const executionId = uuidV4()
    try {
      this.logger.info('Performing action:', action.name)
      broadcastMessage(
        ElectronToRendererMessage.scraperExecutionStarted,
        this.id,
        this.mode,
        executionId,
        {
          scope: ScraperExecutionScope.ACTION,
          action,
        },
      )

      if (action.url) {
        try {
          if (new URL(this.mainPage!.exposed.url()).href !== new URL(action.url).href) {
            await this.mainPage!.goto(action.url, null, {
              timeout: 30_000,
              waitUntil: 'networkidle0',
            })
          }
        } catch (error) {
          this.logger.error(error)
        }
      }

      const actionStepsResults: ActionExecutionResult['actionStepsResults'] = []

      const steps = action.actionSteps.sort(sortNumbers('orderIndex', 'asc'))
      for (const step of steps) {
        const result = await this.performActionStep(step, onDataRequest, onDataSourceItemIdRequest)
        actionStepsResults.push({ step, result })
      }

      broadcastMessage(
        ElectronToRendererMessage.scraperExecutionResult,
        this.id,
        this.mode,
        executionId,
        {
          scope: ScraperExecutionScope.ACTION,
          actionResult: actionStepsResults,
        },
      )
      return {
        action,
        actionStepsResults,
      }
    } finally {
      broadcastMessage(
        ElectronToRendererMessage.scraperExecutionFinished,
        this.id,
        this.mode,
        executionId,
        {
          scope: ScraperExecutionScope.ACTION,
        },
      )
    }
  }

  @assertMainPage
  public async performActionStep(
    actionStep: ActionStep,
    onDataRequest: RequestDataCallback,
    onDataSourceItemIdRequest: RequestDataSourceItemIdCallback,
  ): Promise<MapSiteError> {
    const executionId = uuidV4()
    try {
      this.logger.info('Performing action step:', actionStep.type)
      broadcastMessage(
        ElectronToRendererMessage.scraperExecutionStarted,
        this.id,
        this.mode,
        executionId,
        {
          scope: ScraperExecutionScope.ACTION_STEP,
          actionStep,
        },
      )

      const result = await this.getActionStepResult(
        actionStep,
        onDataRequest,
        onDataSourceItemIdRequest,
      )

      broadcastMessage(
        ElectronToRendererMessage.scraperExecutionResult,
        this.id,
        this.mode,
        executionId,
        {
          scope: ScraperExecutionScope.ACTION_STEP,
          actionStepResult: result,
        },
      )
      return result
    } finally {
      broadcastMessage(
        ElectronToRendererMessage.scraperExecutionFinished,
        this.id,
        this.mode,
        executionId,
        {
          scope: ScraperExecutionScope.ACTION_STEP,
        },
      )
    }
  }

  @assertMainPage
  private async getActionStepResult(
    actionStep: ActionStep,
    onDataRequest: RequestDataCallback,
    onDataSourceItemIdRequest: RequestDataSourceItemIdCallback,
  ): Promise<MapSiteError> {
    switch (actionStep.type) {
      case ActionStepType.WAIT:
        return await this.waitStep(actionStep)
      case ActionStepType.WAIT_FOR_ELEMENT:
        return await this.waitForElementStep(actionStep)
      case ActionStepType.FILL_INPUT:
        return await this.fillInputStep(actionStep, onDataRequest)
      case ActionStepType.SELECT_OPTION:
        return await this.selectOptionStep(actionStep, onDataRequest)
      case ActionStepType.PRESS_BUTTON:
        return await this.pressButtonStep(actionStep)
      case ActionStepType.SAVE_TO_DATA_SOURCE:
        return await this.saveToDataSourceStep(actionStep, onDataSourceItemIdRequest)
      case ActionStepType.CHECK_ERROR:
        return this.checkErrorStep(actionStep)
      case ActionStepType.CHECK_SUCCESS:
        return this.checkSuccessStep(actionStep)
      default:
        this.logger.warn(
          `Unknown step type: ${
            'type' in actionStep ? (actionStep as { type: never }).type : undefined
          }`,
        )
        return { errorType: ActionStepErrorType.UNKNOWN_STEP_TYPE }
    }
  }

  // Steps implemented in separated files
  private waitStep = waitStep
  private waitForElementStep = waitForElementStep
  private fillInputStep = fillInputStep
  private selectOptionStep = selectOptionStep
  private pressButtonStep = pressButtonStep
  private saveToDataSourceStep = saveToDataSourceStep
  private checkErrorStep = checkErrorStep
  private checkSuccessStep = checkSuccessStep

  protected async waitFor(elements: string, timeout?: number): Promise<AwaitedElementHandle>
  protected async waitFor(elements: string[], timeout?: number): Promise<AwaitedElementHandle[]>
  protected async waitFor(elements: string | string[], timeout = 30_000) {
    try {
      if (Array.isArray(elements)) {
        const handles: AwaitedElementHandle[] = []
        for (const el of elements) {
          const handle = await this.mainPage!.waitForSelector(el, { timeout, visible: true })
          handles.push(handle)
        }
        return handles
      } else {
        return await this.mainPage!.waitForSelector(elements, { timeout, visible: true })
      }
    } catch (error) {
      return null
    }
  }
}

type AwaitedElementHandle = ElementHandle<Element> | null

function assertMainPage(_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod: (...args: unknown[]) => unknown = descriptor.value

  descriptor.value = async function (this: Scraper<ScraperMode>, ...args: unknown[]) {
    if (!this.mainPage) {
      throw new Error('Main page is not initialized')
    }
    return originalMethod.apply(this, args)
  }

  return descriptor
}
