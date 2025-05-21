import {
  assert,
  ConditionType,
  deepMerge,
  type PageAction,
  PageActionType,
  randomInt,
  type ScraperCondition,
  type ScraperInstructions,
  type ScraperInstructionsExecutionInfo,
  ScraperInstructionsExecutionInfoType,
  ScraperInstructionType,
  type SimpleLogger,
  uuid,
  wait,
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

  private initPromise: Promise<Browser> | null = null

  private destroyed = false
  private browser: Browser | null = null
  private abortController = new AbortController()

  constructor(private readonly options: ScraperOptions = {}) {
    const { id, logger, ...browserOptions } = options

    this.id = id ?? uuid()
    this.logger = logger ?? {
      ...console,
      fatal: console.error,
    }

    Scraper.instances.set(this.id, this)

    this.init(browserOptions).catch((error) => {
      this.logger.error(error)
      this.destroy()
    })
  }

  private init(options: Partial<LaunchOptions>) {
    if (this.browser) {
      return Promise.resolve(this.browser)
    }

    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = new Promise<Browser>((resolve, reject) => {
      puppeteer
        .launch(
          deepMerge(
            {
              downloadBehavior: { policy: "default" },
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
        .then((browser) => {
          resolve(browser)
          if (this.destroyed) {
            void browser.close()
          }
        })
        .catch(reject)
    })

    this.initPromise
      .then((browser) => (this.browser = browser))
      .catch(this.logger.error)
      .finally(() => {
        this.initPromise = null
      })

    return this.initPromise
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
  ): Promise<ScraperInstructionsExecutionInfo> {
    if (!this.browser) {
      this.browser = await this.init(this.options)
    }

    const startTime = performance.now()
    const page = await this.getPage()
    if (pageMiddleware) {
      await pageMiddleware(page)
    }

    const executionInfo: ScraperInstructionsExecutionInfo = []
    try {
      await this.executeInstructions(page, instructions, 0, executionInfo)
      executionInfo.push({
        type: ScraperInstructionsExecutionInfoType.Success,
        summary: {
          duration: performance.now() - startTime,
        },
      })
    } catch (error) {
      this.logger.error(error)
      executionInfo.push({
        type: ScraperInstructionsExecutionInfoType.Error,
        errorMessage: error instanceof Error ? error.message : String(error),
      })
    }

    await page.close()
    return executionInfo
  }

  private async executeInstructions(
    page: Page,
    instructions: ScraperInstructions,
    level: number,
    executionInfo: ScraperInstructionsExecutionInfo,
  ): Promise<ScraperInstructions[number] | null> {
    for (let i = 0; i < instructions.length; i++) {
      let instruction = instructions[i]

      switch (instruction.type) {
        case ScraperInstructionType.PageAction:
          executionInfo.push({
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              type: instruction.type,
              action: instruction.action,
            },
          })
          await this.performPageAction(page, instruction.action)
          break
        case ScraperInstructionType.Condition:
          {
            this.logger.info({ msg: "Checking condition", condition: instruction.if })

            const isMet = await this.checkCondition(page, instruction.if)

            executionInfo.push({
              type: ScraperInstructionsExecutionInfoType.Instruction,
              instructionInfo: {
                type: instruction.type,
                condition: instruction.if,
                isMet,
              },
            })

            const conditionalInstructionsResult = isMet
              ? await this.executeInstructions(page, instruction.then, level + 1, executionInfo)
              : instruction.else
                ? await this.executeInstructions(page, instruction.else, level + 1, executionInfo)
                : null

            if (conditionalInstructionsResult?.type === ScraperInstructionType.Jump) {
              instruction = conditionalInstructionsResult
              break
            }
          }
          break
        case ScraperInstructionType.Marker:
          executionInfo.push({
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              type: instruction.type,
              name: instruction.name,
            },
          })
          continue
        case ScraperInstructionType.Jump:
          executionInfo.push({
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              type: instruction.type,
              markerName: instruction.markerName,
            },
          })
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
    try {
      switch (condition.type) {
        case ConditionType.IsVisible: {
          const handle = await getElementHandle(page, condition.selector)
          return !!(await handle?.isVisible())
        }
      }
    } catch (error) {
      this.logger.fatal(error)
      return false
    }
  }
}
