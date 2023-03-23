import { wait } from '@web-scraper/common'

import ScraperBrowser from './scraperBrowser'
import type { ScraperPage } from './scraperPage'

export class Scraper {
  // private browser: puppeteer.Browser = null
  protected page: ScraperPage | null = null
  // private readonly options: Required<BotOptions<ParserData>>

  constructor() {
    // eslint-disable-next-line no-console
    console.log('Scraper created')
    // this.options = {
    //   pageTimeout: options.pageTimeout ?? Config.PAGE_TIMEOUT,
    //   userAgent: options.userAgent ?? Config.USER_AGENT,
    //   specialCodesParser: options.specialCodesParser ?? (() => void 0),
    // }
    // this.browser = browser
  }

  /** It basically closes puppeteer page */
  async destroy() {
    await this.page?.destroy()
  }

  /** Initializes new puppeteer page */
  async init(waitAfter = 1000) {
    await ScraperBrowser.instance.waitUntilReady()

    if (this.page) {
      console.error('Scraper page is already initialized')
      return
    }

    this.page = await ScraperBrowser.instance.newPage()

    // await this.page.goto('https://google.com')

    await wait(waitAfter)
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
