import type {
  Browser,
  Page,
  PageEventObject,
  ScreenshotOptions,
  Viewport,
  WaitForOptions,
  WaitForSelectorOptions,
} from 'puppeteer'

export class ScraperPage implements Pick<Page, 'on' | 'off'> {
  private static readonly exposedMethods = [
    'url',
    'waitForNavigation',
    'click',
    'type',
  ] as const satisfies Readonly<(keyof Page)[]>

  private initialized = false

  public static async createFromExisting(
    page: Page,
    userAgent: string,
    viewport?: Viewport | null,
  ) {
    const scraperPage = new ScraperPage(page)
    await scraperPage.init(userAgent, viewport)
    return scraperPage
  }

  public static async create(browser: Browser, userAgent: string, viewport?: Viewport | null) {
    const page = await browser.newPage()
    return ScraperPage.createFromExisting(page, userAgent, viewport)
  }

  private constructor(private readonly page: Page) {
    this.exposed = ScraperPage.exposedMethods.reduce((acc, method) => {
      acc[method] = this.page[method].bind(this.page) as never
      return acc
    }, this.exposed)
  }

  async destroy() {
    const pages = await this.page.browser().pages()
    if (pages.length > 1) {
      await this.page.close()
    } else {
      await this.page.goto('about:blank')
    }
  }

  private async init(userAgent: string, viewport?: Viewport | null) {
    if (this.initialized) {
      return
    }

    if (viewport) {
      await this.page.setViewport(viewport)
    }
    await this.page.setUserAgent(userAgent)
    this.page.setDefaultTimeout(30_000)
    this.page.setDefaultNavigationTimeout(30_000)

    //TODO
    // this.page.on('console', (msg) => {
    //   for (let i = 0; i < msg.args.length; ++i) {
    //     String(msg.args[i]).trim().length &&
    //       // eslint-disable-next-line no-console
    //       console.log(`${i}: ${String(msg.args[i]).trim()}`)
    //   }
    // })

    this.initialized = true
  }

  public on<K extends keyof PageEventObject>(
    eventName: K,
    handler: (event: PageEventObject[K]) => void,
  ) {
    return this.page!.on(eventName, handler)
  }

  public off<K extends keyof PageEventObject>(
    eventName: K,
    handler: (event: PageEventObject[K]) => void,
  ) {
    return this.page!.off(eventName, handler)
  }

  public close(...args: Parameters<Page['close']>) {
    return this.page.close(...args)
  }

  public async goto(
    url: string,
    waitForSelector?: string | null,
    options: WaitForOptions & { referer?: string; referrerPolicy?: string } = {
      waitUntil: 'load',
      timeout: 0,
    },
  ) {
    await this.page.goto(url, options)

    if (waitForSelector) {
      await this.waitForSelector(waitForSelector, { timeout: 30_000 })
    }
  }

  public screenshot(options: ScreenshotOptions & { encoding: 'base64' }) {
    return this.page.screenshot(options)
  }

  public async waitForSelector<Selector extends string>(
    selector: Selector,
    options?: WaitForSelectorOptions,
  ) {
    try {
      const elementHandle = await this.page.waitForSelector(selector, options)
      if (!elementHandle) {
        throw new Error(`Element not found: ${selector}`)
      }
      return elementHandle
    } catch (error) {
      const iFrames = this.page.frames()

      for (const frame of iFrames) {
        const elementHandle = await frame
          .waitForSelector(selector, { ...options, timeout: 2_000 })
          .catch(() => null)
        if (elementHandle) {
          return elementHandle
        }
      }
      throw error
    }
  }

  public exposed = {} as { [K in (typeof ScraperPage.exposedMethods)[number]]: Page[K] }
}
