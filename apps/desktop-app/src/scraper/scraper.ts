import {
  ActionStepErrorType,
  ActionStepType,
  Logger,
  safePromise,
  wait,
  type ActionStep,
  type MapSiteError,
  type Site,
} from '@web-scraper/common'
import type { ElementHandle, Page } from 'puppeteer'
import * as uuid from 'uuid'

import ScraperBrowser from './scraperBrowser'
import type { ScraperPage } from './scraperPage'
import {
  checkErrorStep,
  checkSuccessStep,
  pressButtonStep,
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

  constructor(mode: ScraperMode.DEFAULT)
  constructor(mode: ScraperMode.TESTING, options: ScraperOptions<ScraperMode.TESTING>)
  constructor(mode: ScraperMode.PREVIEW, options: ScraperOptions<ScraperMode.PREVIEW>)
  constructor(public readonly mode: ModeType, options?: ScraperOptions<ModeType>) {
    this.options = options as never
    this.logger = new Logger(
      `[Scraper (mode: ${ScraperMode[this.mode]}) (id: ${this.id.substring(0, 8)})]`,
    )

    this.browser = new ScraperBrowser({
      headless: [ScraperMode.DEFAULT, ScraperMode.PREVIEW].includes(mode) ? 'new' : false,
      defaultViewport:
        mode === ScraperMode.PREVIEW
          ? {
              width: (this as Scraper<ScraperMode.PREVIEW>).options.viewportWidth,
              height: (this as Scraper<ScraperMode.PREVIEW>).options.viewportHeight,
              isMobile: false,
              hasTouch: false,
              deviceScaleFactor: 1,
            }
          : null,
      onBrowserClosed: async () => {
        await this.destroy(false)
        this.options?.onClose?.()
      },
    })

    Scraper.instancesStore[this.mode].set(this.id, this)

    this.logger.info(`Instance created`)

    this.init()
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

  async init() {
    if (this.mainPage) {
      this.logger.error('Main page has been already initialized')
      return
    }

    switch (this.mode) {
      case ScraperMode.DEFAULT:
        this.initDefaultMode()
        break
      case ScraperMode.TESTING:
        await this.initTestingMode()
        break
      case ScraperMode.PREVIEW:
        await this.initPreviewMode()
        break
    }
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
      const url = new URL(self.mainPage!.url())
      if (url.host && url.host !== 'null' && url.host !== targetUrl.host) {
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
  public async performActionStep(
    actionStep: ActionStep,
    // data: ParserData, //TODO: use data source
  ): Promise<MapSiteError> {
    this.logger.info('Performing action step:', actionStep.type)

    switch (actionStep.type) {
      case ActionStepType.WAIT:
        return await this.waitStep(actionStep)
      case ActionStepType.WAIT_FOR_ELEMENT:
        return await this.waitForElementStep(actionStep)
      case ActionStepType.PRESS_BUTTON:
        return await this.pressButtonStep(actionStep)
      // case ActionStepType.FILL_INPUT:
      //   return await this.fillInputStep(actionStep, data)
      // case ActionStepType.SELECT_OPTION:
      //   return await this.selectStep(actionStep, data)
      case ActionStepType.CHECK_ERROR:
        return this.checkErrorStep(actionStep)
      case ActionStepType.CHECK_SUCCESS:
        return this.checkSuccessStep(actionStep)
      default:
        this.logger.warn(`Unknown step type: ${actionStep.type}`)
        return { errorType: ActionStepErrorType.UNKNOWN_STEP_TYPE }
    }

    return { errorType: ActionStepErrorType.NO_ERROR }
  }

  // Steps implemented in separated files
  private waitStep = waitStep
  private waitForElementStep = waitForElementStep
  private pressButtonStep = pressButtonStep
  // private fillInputStep = fillInputStep;
  // private selectStep = selectStep;
  private checkErrorStep = checkErrorStep
  private checkSuccessStep = checkSuccessStep

  protected async waitFor(elements: string, timeOut?: number): Promise<AwaitedElementHandle>
  protected async waitFor(elements: string[], timeOut?: number): Promise<AwaitedElementHandle[]>
  protected async waitFor(elements: string | string[], timeout = 30_000) {
    try {
      if (Array.isArray(elements)) {
        const handles: AwaitedElementHandle[] = []
        for (const el of elements) {
          const handle = await this.mainPage!.exposed.waitForSelector(el, { timeout })
          handles.push(handle)
        }
        return handles
      } else {
        return await this.mainPage!.exposed.waitForSelector(elements, { timeout })
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
      throw new Error('Browser is not initialized')
    }
    return originalMethod.apply(this, args)
  }

  return descriptor
}
