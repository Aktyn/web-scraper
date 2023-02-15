import * as fs from 'fs'
import path from 'path'

import { cacheable, safePromise, waitFor } from '@web-scrapper/common'
import { type Browser, launch } from 'puppeteer'

import { EXTERNAL_DIRECTORY_PATH } from '../common'

import { ScraperPage } from './scraperPage'

export default class ScraperBrowser {
  protected static _instance: ScraperBrowser | null = null

  public static get instance() {
    return ScraperBrowser._instance ?? new ScraperBrowser()
  }

  private browser: Browser | null = null
  private ready = false

  private constructor() {
    if (ScraperBrowser._instance !== null) {
      throw new Error('Only one instance of Browser is allowed')
    }

    this.init()

    // eslint-disable-next-line no-console
    console.info('Browser instance created')
    ScraperBrowser._instance = this
  }

  public static async destroy() {
    await ScraperBrowser._instance?.destroy()
    ScraperBrowser._instance = null
  }

  private async destroy() {
    await this.browser?.close()
    this.browser = null
  }

  private init() {
    safePromise(
      launch({
        //TODO: allow different arguments
        args: [
          // ...(process.env.TOR_PROXY_SERVER
          //   ? [`--proxy-server=${process.env.TOR_PROXY_SERVER}`]
          //   : []),
          '--start-maximized',
          '--disable-infobars',
          '--no-default-browser-check',
        ],
        ignoreDefaultArgs: ['--enable-automation', '--enable-blink-features=IdleDetection'],
        headless: false,
        // devtools: isDev(), //TODO
        defaultViewport: null, //ScraperPage.defaultViewPort,
        handleSIGINT: true,
        ignoreHTTPSErrors: true,
        timeout: 30_000,
        product: 'chrome',
        userDataDir: '', //TODO
      }),
      null,
    ).then(async (browser) => {
      if (!browser) {
        throw new Error('Error during browser initialization')
      }
      const pages = await browser.pages()
      const initPage = pages[0] || (await browser.newPage())

      try {
        await initPage.goto(`data:text/html,${encodeURIComponent(getInfoPageHTML())}`, {
          waitUntil: 'load',
        })
      } catch (error) {
        console.error('Cannot load initial page:', error)
      }

      this.browser = browser
      // eslint-disable-next-line no-console
      console.log('Browser initialized')
      this.ready = true
    })
  }

  public waitUntilReady() {
    return waitFor(() => Promise.resolve(this.ready), 100, 10_000)
  }

  //TODO: decorator throwing error when this.ready === false
  public async newPage() {
    if (!this.browser) {
      throw new Error('Browser is not initialized')
    }

    return ScraperPage.create(this.browser)
  }
}

const getInfoPageHTML = cacheable(() =>
  fs.readFileSync(path.join(EXTERNAL_DIRECTORY_PATH, 'infoPage.html'), 'utf8'),
)
