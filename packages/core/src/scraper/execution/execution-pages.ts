import useProxy from "@lem0-packages/puppeteer-page-proxy"
import {
  assert,
  ScraperInstructionsExecutionInfoType,
  type SimpleLogger,
} from "@web-scraper/common"
import {
  createCursor,
  getRandomPagePoint,
  installMouseHelper,
  type GhostCursor,
} from "ghost-cursor"
import type { Browser, Page, Viewport } from "rebrowser-puppeteer"
import type { ScraperExecutionInfo } from "./scraper-execution-info"

export type ScraperPageContext = {
  index: number
  page: Page
  cursor: GhostCursor
  pagePortalUrl: string | undefined
}

type ExecutionPagesOptions = {
  proxy?: string
  portalUrl?: string
  viewport: Viewport
  logger: SimpleLogger
  executionInfo: ScraperExecutionInfo
  pageMiddleware?: (page: Page) => void | Promise<void>
}

export class ExecutionPages {
  public static emptyPageUrl = "about:blank"

  private pages = new Map<number, ScraperPageContext>()

  constructor(
    private readonly browser: Browser,
    private readonly options: ExecutionPagesOptions,
  ) {}

  private async openPage() {
    assert(
      !!this.browser.connected,
      "Cannot open page when browser is not connected",
    )

    const firstPage = (await this.browser.pages()).at(0)

    const page =
      firstPage && firstPage.url() === ExecutionPages.emptyPageUrl
        ? firstPage
        : await this.browser.newPage()

    await page.setViewport(this.options.viewport)

    try {
      const userAgent =
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
      if (userAgent) {
        this.options.logger.info(`Setting user agent to "${userAgent}"`)
        await page.setUserAgent(userAgent)
      }
    } catch (error) {
      this.options.logger.warn({ msg: "Failed to set user agent", error })
    }

    await page.evaluateOnNewDocument((lang) => {
      Object.defineProperty(navigator, "language", {
        get: function () {
          return lang
        },
      })
    }, "en-US")

    if (this.options.proxy) {
      await useProxy(page, this.options.proxy)
    }

    let pagePortalUrl: string | undefined = undefined
    if (
      this.options.portalUrl &&
      "openPortal" in page &&
      typeof page.openPortal === "function"
    ) {
      pagePortalUrl = await page.openPortal()
    }

    const cursor = createCursor(page, await getRandomPagePoint(page), true)
    cursor.toggleRandomMove(true)
    if (process.env.NODE_ENV === "development") {
      await installMouseHelper(page)
    }

    if (this.options.pageMiddleware) {
      await this.options.pageMiddleware(page)
    }

    return { page, cursor, pagePortalUrl }
  }

  async get(index: number): Promise<ScraperPageContext> {
    let pageContext = this.pages.get(index)
    if (pageContext) {
      return pageContext
    }

    const openedPage = await this.openPage()
    pageContext = { ...openedPage, index }
    this.pages.set(index, pageContext)

    this.options.executionInfo.push(
      {
        type: ScraperInstructionsExecutionInfoType.PageOpened,
        portalUrl: pageContext.pagePortalUrl,
        pageIndex: index,
      },
      false,
    )
    this.options.executionInfo.flush()

    return pageContext
  }

  async getPage(index: number) {
    const pageContext = await this.get(index)
    return pageContext.page
  }

  async closeAll() {
    const pages = Array.from(this.pages.values())

    for (let i = 0; i < pages.length; i++) {
      if (i === 0) {
        await pages[i].page.goto(ExecutionPages.emptyPageUrl)
      } else {
        await pages[i].page.close()
      }
    }

    this.pages.clear()
  }
}
