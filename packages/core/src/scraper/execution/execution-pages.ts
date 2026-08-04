import {
  assert,
  runUnsafe,
  runUnsafeAsync,
  ScraperInstructionsExecutionInfoType,
  type SimpleLogger,
} from "@web-scraper/common"
import type { Browser, Page } from "playwright"
import type { ScraperExecutionInfo } from "./scraper-execution-info"

export type ScraperPageContext = {
  index: number
  page: Page
}

export type PageSnapshot = {
  pageIndex: number
  screenshotBase64: string | null
  url: string | null
  html: string | null
}

type ExecutionPagesOptions = {
  viewport: { width: number; height: number }
  logger: SimpleLogger
  executionInfo: ScraperExecutionInfo
  pageMiddleware?: (page: Page) => void | Promise<void>
}

export class ExecutionPages {
  public static emptyPageUrl = "about:blank"

  private pages = new Map<number, ScraperPageContext>()

  constructor(
    public readonly browser: Browser,
    private readonly options: ExecutionPagesOptions,
  ) {}

  private async openPage() {
    const context = await this.browser.newContext({ viewport: null })
    assert(!!context, "Cannot create browser context")

    const page = await context.newPage()

    try {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "language", {
          get: function () {
            return "en-US"
          },
        })
        Object.defineProperty(navigator, "languages", {
          get: function () {
            return ["en-US", "en"]
          },
        })
        Object.defineProperty(navigator, "webdriver", {
          get: function () {
            return undefined
          },
        })
      })
    } catch (error) {
      this.options.logger.warn({ msg: "Failed to set init script", error })
    }

    if (this.options.pageMiddleware) {
      await this.options.pageMiddleware(page)
    }

    return { page }
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
        pageIndex: index,
      },
      false,
    )
    this.options.executionInfo.flush()

    return pageContext
  }

  getPage(index: number, init?: true): Promise<Page>
  getPage(index: number, init: false): Page | null
  getPage(index: number, init = true) {
    if (init) {
      return this.get(index).then((pageContext) => pageContext.page)
    } else {
      return this.pages.get(index)?.page ?? null
    }
  }

  async closeAll() {
    const pages = Array.from(this.pages.values())

    for (let i = 0; i < pages.length; i++) {
      try {
        if (i === 0) {
          await pages[i].page.goto(ExecutionPages.emptyPageUrl)
        } else {
          await pages[i].page.close()
        }
      } catch {
        // Page may already be closed or browser context may be gone
      }
    }

    this.pages.clear()
  }

  getPageSnapshots(): Promise<PageSnapshot[]> {
    return Promise.all(
      Array.from(this.pages.entries()).map(async ([pageIndex, pageContext]) => {
        const screenshotBase64 = await runUnsafeAsync<string | null>(
          async () => {
            const buffer = await pageContext.page.screenshot({
              type: "jpeg",
              quality: 100,
              fullPage: true,
            })
            return buffer.toString("base64")
          },
        )

        return {
          pageIndex,
          screenshotBase64,
          url: runUnsafe(() => pageContext.page.url()),
          html: await runUnsafeAsync(() => pageContext.page.content()),
        }
      }),
    )
  }
}
