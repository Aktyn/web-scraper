import type { Browser, Page } from 'puppeteer'
import { getRandom } from 'random-useragent'

export class ScraperPage {
  // public static readonly defaultViewPort: Viewport = {
  //   width: 1280,
  //   height: 720,
  //   isMobile: false,
  //   hasTouch: false,
  //   deviceScaleFactor: 1,
  // }

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

  public async goto(url: string, waitFor?: string) {
    await this.page.goto(url, {
      waitUntil: 'load',
      timeout: 0,
    })

    if (waitFor) {
      await this.page.waitForSelector(waitFor)
    }
  }
}
