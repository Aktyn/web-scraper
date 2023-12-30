import * as fs from 'fs'
import path from 'path'

import { cacheable, waitFor } from '@web-scraper/common'
import isDev from 'electron-is-dev'
import {
  type Browser,
  type EventType,
  type Handler,
  type PuppeteerLaunchOptions,
  type Viewport,
} from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { getRandom as getRandomUserAgent } from 'random-useragent'

import { EXTERNAL_DIRECTORY_PATH } from '../utils'

import { ScraperPage } from './scraperPage'

puppeteer.use(StealthPlugin())

interface ScraperBrowserOptions {
  loadInfoPage?: boolean
  onBrowserClosed?: () => void
}

export default class ScraperBrowser {
  public static busySlots = new Set<number>()
  public static readonly defaultViewport: Viewport = {
    width: 1280,
    height: 1024,
    isMobile: false,
    hasTouch: false,
    deviceScaleFactor: 1,
  }

  private readonly instanceSlot: number
  protected browser: Browser | null = null
  private readonly userAgent = getRandomDesktopUserAgentWithChrome()
  private readonly viewport: Viewport | null

  constructor({
    loadInfoPage,
    onBrowserClosed,
    ...options
  }: Partial<PuppeteerLaunchOptions & ScraperBrowserOptions> = {}) {
    for (let i = 0; ; i++) {
      if (!ScraperBrowser.busySlots.has(i)) {
        this.instanceSlot = i
        break
      }
    }

    ScraperBrowser.busySlots.add(this.instanceSlot)

    const headless = options.headless ?? false

    this.viewport = headless ? options.defaultViewport ?? ScraperBrowser.defaultViewport : null

    puppeteer
      .launch({
        // executablePath: executablePath('chrome'), //TODO: test executablePath('chrome') on system without chrome
        channel: 'chrome',
        product: 'chrome',
        //TODO: allow different arguments
        args: [
          // ...(process.env.TOR_PROXY_SERVER
          //   ? [`--proxy-server=${process.env.TOR_PROXY_SERVER}`]
          //   : []),
          // '--start-maximized',

          '--disable-infobars',
          '--no-default-browser-check',
          '--lang=en-US,en',
        ],
        ignoreDefaultArgs: [
          '--enable-automation',
          '--enable-blink-features=IdleDetection',
          '--disable-blink-features=AutomationControlled',
        ],
        headless,
        devtools: isDev,
        defaultViewport: headless ? ScraperBrowser.defaultViewport : null,
        handleSIGINT: true,
        ignoreHTTPSErrors: true,
        timeout: 30_000,
        userDataDir:
          isDev && !process.env.JEST_WORKER_ID
            ? path.join(
                EXTERNAL_DIRECTORY_PATH,
                `userData${this.instanceSlot > 0 ? this.instanceSlot : ''}`,
              )
            : '',
        ...options,
      })
      .then(async (browser) => {
        if (!browser) {
          throw new Error('Error during browser initialization')
        }

        browser.on('disconnected', () => {
          onBrowserClosed?.()
        })

        if (loadInfoPage) {
          try {
            const initPage = await this.getFirstPage()
            await initPage.goto(`data:text/html,${encodeURIComponent(getInfoPageHTML())}`, null, {
              waitUntil: 'load',
            })
          } catch (error) {
            console.error('Cannot load initial page:', error)
          }
        }

        this.browser = browser

        console.info(
          `Browser initialized with user agent: ${this.userAgent}; slot: ${this.instanceSlot}`,
        )
      })
      .catch((error) => console.error('Puppeteer launch error', error))
  }

  public async destroy() {
    ScraperBrowser.busySlots.delete(this.instanceSlot)
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
    return ScraperPage.create(this.browser!, this.userAgent, this.viewport)
  }

  @waitForBrowser
  public async getFirstPage() {
    const pages = await this.browser!.pages()
    return pages[0]
      ? await ScraperPage.createFromExisting(pages[0], this.userAgent, this.viewport)
      : await this.newPage()
  }
}

const getInfoPageHTML = cacheable(() =>
  fs.readFileSync(path.join(EXTERNAL_DIRECTORY_PATH, 'infoPage.html'), 'utf8'),
)

function getRandomDesktopUserAgentWithChrome() {
  let maxAttempts = 10_000
  while (maxAttempts-- > 0) {
    const userAgent = getRandomUserAgent()
    if (
      userAgent.includes('Chrome') &&
      !userAgent.includes('Mobile') &&
      !userAgent.includes('Tablet') &&
      !userAgent.includes('Android') &&
      !userAgent.includes('iOS') &&
      !userAgent.includes('Windows Phone') &&
      !userAgent.includes('Lumia')
    ) {
      return userAgent
    }
  }

  return getRandomUserAgent()
}

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
