import {
  ActionStepErrorType,
  ActionStepType,
  GLOBAL_ACTION_PREFIX,
  GlobalActionType,
  Logger,
  REGULAR_ACTION_PREFIX,
  isGlobalAction,
  isRegularAction,
  omit,
  safePromise,
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
  type Site,
} from '@web-scraper/common'
import type { ElementHandle, Page } from 'puppeteer'
import * as uuid from 'uuid'

import type { RequestDataCallback } from '.'
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

export enum ScraperMode {
  DEFAULT,
  TESTING,
  PREVIEW,
}

type ScraperOptions<ModeType extends ScraperMode> = (ModeType extends ScraperMode.TESTING
  ? { siteId: Site['id']; lockURL: string }
  : ModeType extends ScraperMode.PREVIEW
  ? { viewportWidth: number; viewportHeight: number }
  : never) & {
  onClose?: () => void
}

export class Scraper<ModeType extends ScraperMode> {
  public static readonly Mode = ScraperMode

  private static readonly instancesStore: {
    [ModeKey in ScraperMode]: Map<string, Scraper<ModeKey>>
  } = {
    [ScraperMode.DEFAULT]: new Map<string, Scraper<ScraperMode.DEFAULT>>(),
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
  public readonly id = uuid.v4()
  protected readonly logger: Logger

  private readonly browser: ScraperBrowser
  protected mainPage: ScraperPage | null = null
  private readonly options: ModeType extends ScraperMode.DEFAULT
    ? undefined
    : ScraperOptions<ModeType>
  private initialized = false

  constructor(mode: ScraperMode.DEFAULT)
  constructor(mode: ScraperMode.TESTING, options: ScraperOptions<ScraperMode.TESTING>)
  constructor(mode: ScraperMode.PREVIEW, options: ScraperOptions<ScraperMode.PREVIEW>)
  constructor(public readonly mode: ModeType, options?: ScraperOptions<ModeType>) {
    this.options = options as never
    this.logger = new Logger(
      `[Scraper (mode: ${ScraperMode[this.mode]}) (id: ${this.id.substring(0, 8)})]`,
    )

    this.browser = new ScraperBrowser({
      headless:
        [ScraperMode.DEFAULT, ScraperMode.PREVIEW].includes(mode) || process.env.VITEST_WORKER_ID
          ? 'new'
          : false,
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
      throw error
    }
  }

  private async init() {
    if (this.mainPage) {
      this.logger.error('Main page has been already initialized')
      return
    }

    switch (this.mode) {
      case ScraperMode.DEFAULT:
        await this.initDefaultMode()
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

  private async initDefaultMode(self = this as Scraper<ScraperMode.DEFAULT>) {
    self.mainPage = await self.browser.newPage()
    await wait(1000)
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
  public async performProcedure(
    procedure: Procedure,
    actions: Action[],
    onDataRequest: RequestDataCallback,
  ): Promise<ProcedureExecutionResult> {
    this.logger.info('Performing procedure:', procedure.type)

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
        return {
          procedure,
          flowExecutionResult: { errorType: ActionStepErrorType.ELEMENT_NOT_FOUND },
        }
      }
    }

    return {
      procedure,
      flowExecutionResult: await this.performFlow(procedure.flow, actions, onDataRequest),
    }
  }

  @assertMainPage
  public async performFlow(
    flow: FlowStep,
    actions: Action[],
    onDataRequest: RequestDataCallback,
  ): Promise<FlowExecutionResult> {
    this.logger.info('Performing flow starting with action:', flow.actionName)

    const flowStepsResults: FlowExecutionResult['flowStepsResults'] = []

    if (isRegularAction(flow.actionName)) {
      const actionName = flow.actionName.substring(REGULAR_ACTION_PREFIX.length + 1)
      const action = actions.find((action) => action.name === actionName)
      if (!action) {
        throw new Error(`Action ${actionName} not found`)
      }

      const actionResult = await this.performAction(action, onDataRequest)
      const succeeded = actionResult.actionStepsResults.every(
        (stepResult) => stepResult.result.errorType === ActionStepErrorType.NO_ERROR,
      )

      flowStepsResults.push({
        flowStep: omit(flow, 'onSuccess', 'onFailure'),
        actionResult,
        returnedValues: [],
        succeeded,
      })

      if (succeeded) {
        if (!flow.onSuccess) {
          throw new Error(`Flow ${flow.actionName} has no onSuccess flow`)
        }
        const successResult = await this.performFlow(flow.onSuccess, actions, onDataRequest)
        flowStepsResults.push(...successResult.flowStepsResults)
      } else {
        if (!flow.onFailure) {
          throw new Error(`Flow ${flow.actionName} has no onFailure flow`)
        }
        const failureResult = await this.performFlow(flow.onFailure, actions, onDataRequest)
        flowStepsResults.push(...failureResult.flowStepsResults)
      }
    } else if (isGlobalAction(flow.actionName)) {
      const globalAction = flow.actionName.substring(
        GLOBAL_ACTION_PREFIX.length + 1,
      ) as GlobalActionType

      flowStepsResults.push({
        flowStep: omit(flow, 'onSuccess', 'onFailure'),
        actionResult: null,
        returnedValues: [], //TODO
        succeeded: globalAction !== GlobalActionType.FINISH_WITH_ERROR,
      })

      switch (globalAction) {
        case GlobalActionType.FINISH:
        case GlobalActionType.FINISH_WITH_ERROR:
          // noop
          break
        case GlobalActionType.FINISH_WITH_NOTIFICATION:
          //TODO: show system notification according to flow data
          break
        default:
          throw new Error(`Invalid global action: ${globalAction}`)
      }
    } else {
      throw new Error(`Invalid action name: ${flow.actionName}`)
    }

    return {
      flow,
      flowStepsResults,
    }
  }

  @assertMainPage
  public async performAction(
    action: Action,
    onDataRequest: RequestDataCallback,
  ): Promise<ActionExecutionResult> {
    this.logger.info('Performing action:', action.name)

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
      const result = await this.performActionStep(step, onDataRequest)
      actionStepsResults.push({ step, result })
    }

    return {
      action,
      actionStepsResults,
    }
  }

  @assertMainPage
  public async performActionStep(
    actionStep: ActionStep,
    onDataRequest: RequestDataCallback,
  ): Promise<MapSiteError> {
    this.logger.info('Performing action step:', actionStep.type)

    switch (actionStep.type) {
      case ActionStepType.WAIT:
        return await this.waitStep(actionStep)
      case ActionStepType.WAIT_FOR_ELEMENT:
        return await this.waitForElementStep(actionStep)
      case ActionStepType.PRESS_BUTTON:
        return await this.pressButtonStep(actionStep)
      case ActionStepType.FILL_INPUT:
        return await this.fillInputStep(actionStep, onDataRequest)
      case ActionStepType.SELECT_OPTION:
        return await this.selectOptionStep(actionStep, onDataRequest)
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
  private pressButtonStep = pressButtonStep
  private fillInputStep = fillInputStep
  private selectOptionStep = selectOptionStep
  private checkErrorStep = checkErrorStep
  private checkSuccessStep = checkSuccessStep

  protected async waitFor(elements: string, timeOut?: number): Promise<AwaitedElementHandle>
  protected async waitFor(elements: string[], timeOut?: number): Promise<AwaitedElementHandle[]>
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
