import type { Browser, Page, PageEventObject, ScreenshotOptions, WaitForOptions } from 'puppeteer'
import { getRandom } from 'random-useragent'

export class ScraperPage implements Pick<Page, 'on' | 'off'> {
  private readonly page: Page
  private initialized = false

  public static async createFromExisting(page: Page) {
    const scraperPage = new ScraperPage(page)
    await scraperPage.init()
    return scraperPage
  }

  public static async create(browser: Browser) {
    return ScraperPage.createFromExisting(await browser.newPage())
  }

  private constructor(page: Page) {
    this.page = page
  }

  async destroy() {
    const pages = await this.page.browser().pages()
    if (pages.length > 1) {
      await this.page.close()
    } else {
      await this.page.goto('about:blank')
    }
  }

  private async init() {
    if (this.initialized) {
      return
    }

    // await this.page.setViewport(ScraperPage.defaultViewPort)
    this.page.setDefaultTimeout(10_000)
    this.page.setDefaultNavigationTimeout(10_000)

    //TODO
    // this.page.on('console', (msg) => {
    //   for (let i = 0; i < msg.args.length; ++i) {
    //     String(msg.args[i]).trim().length &&
    //       // eslint-disable-next-line no-console
    //       console.log(`${i}: ${String(msg.args[i]).trim()}`)
    //   }
    // })

    await this.page.setUserAgent(getRandom())

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
      await this.page.waitForSelector(waitForSelector)
    }
  }

  screenshot(options: ScreenshotOptions & { encoding: 'base64' }) {
    return this.page.screenshot(options)
  }

  close(...args: Parameters<Page['close']>) {
    return this.page.close(...args)
  }

  url() {
    return this.page.url()
  }
}
