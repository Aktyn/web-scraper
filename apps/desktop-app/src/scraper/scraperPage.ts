import { type ApiError, ErrorCode } from '@web-scraper/common'
import { app } from 'electron'
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  createCursor,
  getRandomPagePoint,
  installMouseHelper,
  type GhostCursor,
} from 'ghost-cursor'
import type {
  Browser,
  ElementHandle,
  Page,
  ScreenshotOptions,
  Viewport,
  WaitForOptions,
  WaitForSelectorOptions,
} from 'puppeteer'

import { pageEvaluators } from './helpers'

export class ScraperPage implements Pick<Page, 'on' | 'off'> {
  private static readonly exposedMethods = [
    'url',
    'waitForNavigation',
    'click',
    'type',
    'keyboard',
  ] as const satisfies Readonly<(keyof Page)[]>

  private ghostCursor: GhostCursor | null = null
  private initialized = false
  private highlightedStyleTagHandle: ElementHandle<HTMLStyleElement> | null = null

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
      const source = this.page[method]
      if (typeof source !== 'function') {
        acc[method] = source as never
      } else {
        acc[method] = source.bind(this.page) as never
      }
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

    try {
      //@ts-expect-error types overlapping from different versions
      this.ghostCursor = createCursor(this.page)
      this.ghostCursor.toggleRandomMove(true)

      //@ts-expect-error types overlapping from different versions
      const randomStartingPoint = await getRandomPagePoint(this.page)
      await this.ghostCursor.moveTo(randomStartingPoint)

      if (!app.isPackaged) {
        //@ts-expect-error types overlapping from different versions
        await installMouseHelper(this.page)
      }
    } catch (error) {
      console.error('Error during ghost cursor initialization:', error)
    }

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

  public on: Page['on'] = (eventName, handler) => this.page!.on(eventName, handler)

  public off: Page['off'] = (eventName, handler) => this.page!.off(eventName, handler)

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
    if (this.page.url() !== url) {
      await this.page.goto(url, options)
    }

    if (waitForSelector) {
      await this.waitForSelector(waitForSelector, { timeout: 30_000 })
    }
  }

  public ghostClick(target: ElementHandle<Element>) {
    //@ts-expect-error types overlapping from different versions
    return this.ghostCursor?.click(target, {
      hesitate: Math.round(500 + Math.random() * 500),
      waitForClick: Math.round(500 + Math.random() * 500),
      waitForSelector: 5_000,
    })
  }

  private async disposeHighlightStyleTag() {
    try {
      await this.highlightedStyleTagHandle?.evaluate((styleTag) => styleTag.remove())
      await this.highlightedStyleTagHandle?.dispose()
      this.highlightedStyleTagHandle = null
    } catch {
      // noop
    }
  }

  public async pickElement() {
    await this.disposeHighlightStyleTag()
    this.highlightedStyleTagHandle = await this.page.addStyleTag({
      content: `.highlighted {
          opacity: 1 !important;
          box-shadow:
            0 0 6px 0 rgba(236, 64, 122, 0.25),
            0 0 0 6px rgba(236, 64, 122, 0.5) inset,
            0 0 0 256px rgba(236, 64, 122, 0.1) inset !important;
          cursor: pointer !important;
      }`,
    })

    const jsPath = await this.page.evaluate(pageEvaluators.getPageElementJsPath)

    if (jsPath) {
      try {
        const handle = await this.page.waitForSelector(jsPath, {
          timeout: 2_000,
        })
        if (!handle) {
          await this.disposeHighlightStyleTag()
          throw {
            errorCode: ErrorCode.INTERNAL_ERROR,
            error: `"${jsPath}" is not a valid selector`,
          } satisfies ApiError
        }
      } catch {
        await this.disposeHighlightStyleTag()
        throw {
          errorCode: ErrorCode.INTERNAL_ERROR,
          error: `"${jsPath}" is not a valid selector`,
        } satisfies ApiError
      }
    }

    await this.disposeHighlightStyleTag()
    return jsPath
  }

  public async cancelPickingElement() {
    await this.disposeHighlightStyleTag()
    return this.page.evaluate(pageEvaluators.stopAndRemoveInteractiveElementSelector)
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
