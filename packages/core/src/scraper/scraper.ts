import {
  assert,
  ConditionType,
  deepMerge,
  type PageAction,
  PageActionType,
  randomInt,
  type ScraperCondition,
  type ScraperInstructions,
  ScraperInstructionType,
  type SimpleLogger,
  uuid,
  wait,
  waitFor,
} from "@web-scraper/common"
import puppeteer, { type Browser, type LaunchOptions, type Page } from "rebrowser-puppeteer"
import { getElementHandle } from "./selectors"

type ScraperOptions = {
  id?: string
  logger?: SimpleLogger
} & Partial<LaunchOptions>

export class Scraper {
  private static instances = new Map<string, Scraper>()

  public static destroyAll() {
    for (const instance of Scraper.instances.values()) {
      instance.destroy()
    }
    assert(Scraper.instances.size === 0, "Scraper instances have not been destroyed correctly")
  }

  private readonly id: string
  private readonly logger: SimpleLogger

  private destroyed = false
  private browser: Browser | null = null
  private abortController = new AbortController()

  constructor({ id, logger, ...options }: ScraperOptions = {}) {
    this.id = id ?? uuid()
    this.logger = logger ?? console

    Scraper.instances.set(this.id, this)

    this.init(options).catch((error) => {
      this.logger.error(error)
      this.destroy()
    })
  }

  private async init(options?: Partial<LaunchOptions>) {
    this.browser = await puppeteer.launch(
      deepMerge(
        {
          headless: false,
          defaultViewport: { width: 1280, height: 720 },
          args: [
            "--disable-infobars",
            "--window-size=1284,848",
            "--lang=en-US",
            "--accept-language=en-US",
          ],
          env: {
            ...process.env,
            LANGUAGE: "en-US",
          },
        },
        options ?? {},
      ),
    )

    if (this.destroyed) {
      await this.browser.close()
    }
  }

  destroy() {
    Scraper.instances.delete(this.id)

    this.abortController.abort("Scraper instance destroyed")

    assert(!this.destroyed, "Scraper already destroyed")

    if (this.browser) {
      void this.browser
        .close()
        .then(() => this.logger.info("Browser closed"))
        .catch(this.logger.error)
    }

    this.destroyed = true
    this.browser = null
  }

  private async getPage() {
    assert(!!this.browser, "Browser not initialized")

    const firstPage = (await this.browser.pages()).at(0)

    const page =
      firstPage && firstPage.url() === "about:blank" ? firstPage : await this.browser.newPage()
    await page.evaluateOnNewDocument((lang) => {
      Object.defineProperty(navigator, "language", {
        get: function () {
          return lang
        },
      })
    }, "en-US")

    return page
  }

  async run(
    instructions: ScraperInstructions,
    pageMiddleware?: (page: Page) => void | Promise<void>,
  ) {
    await waitFor(() => this.browser !== null, 5_000)
    const page = await this.getPage()
    if (pageMiddleware) {
      await pageMiddleware(page)
    }
    await this.executeInstructions(page, instructions)

    // await page.close() //TODO: close page after job is done
  }

  private async executeInstructions(
    page: Page,
    instructions: ScraperInstructions,
    level = 0,
  ): Promise<ScraperInstructions[number] | null> {
    for (let i = 0; i < instructions.length; i++) {
      let instruction = instructions[i]

      switch (instruction.type) {
        case ScraperInstructionType.PageAction:
          await this.performPageAction(page, instruction.action)
          break
        case ScraperInstructionType.Condition:
          {
            this.logger.info({ msg: "Checking condition", condition: instruction.if })

            const conditionalInstructionsResult = (await this.checkCondition(page, instruction.if))
              ? await this.executeInstructions(page, instruction.then, level + 1)
              : instruction.else
                ? await this.executeInstructions(page, instruction.else, level + 1)
                : null
            if (conditionalInstructionsResult?.type === ScraperInstructionType.Jump) {
              instruction = conditionalInstructionsResult
              break
            }
          }
          break
        case ScraperInstructionType.Marker:
          continue
        case ScraperInstructionType.Jump:
          break
      }

      if (instruction.type === ScraperInstructionType.Jump) {
        i = instructions.findIndex(
          (marker) =>
            marker.type === ScraperInstructionType.Marker && marker.name === instruction.markerName,
        )
        assert(level > 0 || i !== -1, `Marker "${instruction.markerName}" not found`)

        if (i === -1) {
          this.logger.warn("Marker not found, returning to previous level")
          return instruction
        }
      }
    }
    return null
  }

  private async performPageAction(page: Page, action: PageAction) {
    this.logger.info({ msg: "Performing action", action })
    switch (action.type) {
      case PageActionType.Wait:
        await wait(action.duration)
        break
      case PageActionType.Navigate:
        await page.goto(action.url, { timeout: 60_000 })
        break
      case PageActionType.Click: {
        const handle = await getElementHandle(page, action.selector, true)
        await handle.click({
          delay: randomInt(1, 4),
        })
        break
      }
      case PageActionType.Type: {
        const handle = await getElementHandle(page, action.selector, true)
        if (action.clearBeforeType) {
          await handle.evaluate((el) => {
            if (el instanceof HTMLInputElement) {
              el.value = ""
            }
          })
        }
        await handle.type(action.text, { delay: randomInt(1, 4) })
        break
      }
    }
  }

  private async checkCondition(page: Page, condition: ScraperCondition) {
    switch (condition.type) {
      case ConditionType.IsVisible: {
        const handle = await getElementHandle(page, condition.selector)
        return !!(await handle?.isVisible())
      }
    }
  }
}
