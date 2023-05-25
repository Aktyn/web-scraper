import { safePromise, wait } from '@web-scraper/common'
import * as uuid from 'uuid'

import ScraperBrowser from './scraperBrowser'
import type { ScraperPage } from './scraperPage'

export enum ScraperMode {
  DEFAULT = 0,
  TESTING = 1,
}

type ScraperOptions<ModeType extends ScraperMode> = (ModeType extends ScraperMode.TESTING
  ? { lockURL: string }
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
  }
  public static getInstances<ModeKey extends ScraperMode>(mode: ModeKey) {
    return Scraper.instancesStore[mode]
  }

  public readonly id = uuid.v4()

  private readonly browser: ScraperBrowser
  protected mainPage: ScraperPage | null = null
  private readonly options: ModeType extends ScraperMode.DEFAULT
    ? undefined
    : ScraperOptions<ModeType>

  constructor(mode: ScraperMode.DEFAULT)
  constructor(mode: ScraperMode.TESTING, options: ScraperOptions<ModeType>)
  constructor(public readonly mode: ModeType, options?: ScraperOptions<ModeType>) {
    this.options = options as never

    this.browser = new ScraperBrowser({
      headless: mode === ScraperMode.DEFAULT ? 'new' : false,
      onBrowserClosed: async () => {
        await this.destroy(false)
        this.options?.onClose?.()
      },
    })

    Scraper.instancesStore[this.mode].set(this.id, this)

    // eslint-disable-next-line no-console
    console.log('Scraper instance created')

    //TODO: clean up
    // this.options = {
    // pageTimeout: options.pageTimeout ?? Config.PAGE_TIMEOUT,
    // userAgent: options.userAgent ?? Config.USER_AGENT,
    // specialCodesParser: options.specialCodesParser ?? (() => void 0),
    // }
    // this.browser = browser

    this.init()
  }

  /** It basically closes puppeteer page */
  async destroy(destroyBrowser = true) {
    Scraper.instancesStore[this.mode].delete(this.id)
    this.mainPage && (await safePromise(this.mainPage.destroy()))
    this.mainPage = null
    if (destroyBrowser) {
      await safePromise(this.browser.destroy())
    }
  }

  public getTestingURL: ModeType extends ScraperMode.TESTING ? () => string : never = (() => {
    if (this.mode !== ScraperMode.TESTING) {
      throw new Error('Scraper is not in testing mode')
    }
    return (this as Scraper<ScraperMode.TESTING>).options.lockURL
  }) as never

  async init() {
    if (this.mainPage) {
      console.error('Scraper main page has been already initialized')
      return
    }

    switch (this.mode) {
      case ScraperMode.DEFAULT:
        this.initDefaultMode()
        break
      case ScraperMode.TESTING:
        await this.initTestingMode()
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
  }

  // protected async waitFor(elements: string, timeOut?: number): Promise<puppeteer.ElementHandle<Element>>;
  // protected async waitFor(elements: string[], timeOut?: number): Promise<puppeteer.ElementHandle<Element>[]>;
  // protected async waitFor(elements: string | string[], timeOut = this.options.pageTimeout) {
  //   try {
  //     if (Array.isArray(elements)) {
  //       const handles: puppeteer.ElementHandle<Element>[] = [];
  //       for (const el of forceArray(elements)) {
  //         const handle = await this.page.waitForSelector(el, { timeout: timeOut });
  //         handles.push(handle);
  //       }
  //       return handles;
  //     } else {
  //       return await this.page.waitForSelector(elements, { timeout: timeOut });
  //     }
  //   } catch (error) {
  //     return null;
  //   }
  // }
}
