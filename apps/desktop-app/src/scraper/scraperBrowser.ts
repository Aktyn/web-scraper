import * as fs from 'fs'
import path from 'path'

import { cacheable, safePromise, waitFor } from '@web-scraper/common'
import isDev from 'electron-is-dev'
import {
  launch,
  type Browser,
  type EventType,
  type Handler,
  type PuppeteerLaunchOptions,
} from 'puppeteer'

import { EXTERNAL_DIRECTORY_PATH } from '../utils'

import { ScraperPage } from './scraperPage'

interface ScraperBrowserOptions {
  loadInfoPage?: boolean
  onBrowserClosed?: () => void
}

export default class ScraperBrowser {
  protected browser: Browser | null = null

  constructor({
    loadInfoPage,
    onBrowserClosed,
    ...options
  }: Partial<PuppeteerLaunchOptions & ScraperBrowserOptions> = {}) {
    safePromise(
      launch({
        //TODO: allow different arguments
        args: [
          // ...(process.env.TOR_PROXY_SERVER
          //   ? [`--proxy-server=${process.env.TOR_PROXY_SERVER}`]
          //   : []),
          // '--start-maximized',
          '--disable-infobars',
          '--no-default-browser-check',
        ],
        ignoreDefaultArgs: ['--enable-automation', '--enable-blink-features=IdleDetection'],
        headless: false,
        devtools: isDev,
        defaultViewport: null, //ScraperPage.defaultViewPort,
        handleSIGINT: true,
        ignoreHTTPSErrors: true,
        timeout: 30_000,
        product: 'chrome',
        userDataDir: '', //TODO
        ...options,
      }),
    ).then(async (browser) => {
      if (!browser) {
        throw new Error('Error during browser initialization')
      }

      browser.on('disconnected', () => {
        onBrowserClosed?.()
      })

      const pages = await browser.pages()
      const initPage = pages[0] || (await browser.newPage())

      if (loadInfoPage) {
        try {
          await initPage.goto(`data:text/html,${encodeURIComponent(getInfoPageHTML())}`, {
            waitUntil: 'load',
          })
        } catch (error) {
          console.error('Cannot load initial page:', error)
        }
      }

      this.browser = browser

      // eslint-disable-next-line no-console
      console.log('Browser initialized')
    })
  }

  public async destroy() {
    await this.browser?.close()
    this.browser = null
  }

  @waitForBrowser
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async on(event: EventType, handler: Handler<any>) {
    return this.browser!.on(event, handler)
  }

  @waitForBrowser
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async off(event: EventType, handler: Handler<any>) {
    return this.browser!.off(event, handler)
  }

  @waitForBrowser
  public async newPage() {
    return ScraperPage.create(this.browser!)
  }

  @waitForBrowser
  public async getFirstPage() {
    const pages = await this.browser!.pages()
    return pages[0] ? await ScraperPage.createFromExisting(pages[0]) : await this.newPage()
  }
}

const getInfoPageHTML = cacheable(() =>
  fs.readFileSync(path.join(EXTERNAL_DIRECTORY_PATH, 'infoPage.html'), 'utf8'),
)

function waitForBrowser(_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod: (...args: unknown[]) => unknown = descriptor.value

  descriptor.value = async function (this: ScraperBrowser, ...args: unknown[]) {
    await waitFor(() => Promise.resolve(!!this.browser), 100, 10_000)
    if (!this.browser) {
      throw new Error('Browser is not initialized')
    }
    return originalMethod.apply(this, args)
  }

  return descriptor
}
