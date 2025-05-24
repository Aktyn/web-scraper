import {
  assert,
  deepMerge,
  type PageAction,
  PageActionType,
  randomInt,
  type ScraperCondition,
  ScraperConditionType,
  type ScraperInstructionInfo,
  type ScraperInstructions,
  type ScraperInstructionsExecutionInfo,
  ScraperInstructionsExecutionInfoType,
  ScraperInstructionType,
  type SimpleLogger,
  uuid,
  wait,
} from "@web-scraper/common"
import puppeteer, { type Browser, type LaunchOptions, type Page } from "rebrowser-puppeteer"
import { type DataBridge, getScraperValue } from "./data-helper"
import { type ScraperExecutionContext } from "./helpers"
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
                process.env.CI ? "--no-sandbox" : undefined,
              ].filter((arg) => typeof arg === "string"),
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
    dataBridge: DataBridge,
    options?: {
      pageMiddleware?: (page: Page) => void | Promise<void>
      leavePageOpen?: boolean
    },
  ): Promise<ScraperInstructionsExecutionInfo> {
    if (!this.browser) {
      this.browser = await this.init(this.options)
    }

    const startTime = performance.now()
    const page = await this.getPage()
    if (options?.pageMiddleware) {
      await options.pageMiddleware(page)
    }

    const executionInfo: ScraperInstructionsExecutionInfo = []
    try {
      await this.executeInstructions(
        { page, dataBridge, executionInfo, logger: this.logger },
        instructions,
        undefined,
      )

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

    if (!options?.leavePageOpen) {
      await page.close()
    }

    return executionInfo
  }

  private async executeInstructions(
    context: ScraperExecutionContext,
    instructions: ScraperInstructions,
    level = 0,
  ): Promise<ScraperInstructions[number] | null> {
    assert(instructions.length > 0, "Instructions are empty")
    assert(
      level > 0 ||
        (instructions[0].type === ScraperInstructionType.PageAction &&
          instructions[0].action.type === PageActionType.Navigate),
      "First instruction must be a navigation action",
    )

    const pushInstructionInfo = <T extends ScraperInstructionInfo>(instructionInfo: T) => {
      const info = {
        type: ScraperInstructionsExecutionInfoType.Instruction,
        instructionInfo,
        url: context.page.url(),
        duration: 0,
      } satisfies ScraperInstructionsExecutionInfo[number] & { instructionInfo: T }
      context.executionInfo.push(info)
      return info
    }

    for (let i = 0; i < instructions.length; i++) {
      let instruction = instructions[i]

      const instructionStartUrl = context.page.url()
      const instructionStartTime = performance.now()
      let lastInstructionInfo: ScraperInstructionsExecutionInfo[number] | null = null

      switch (instruction.type) {
        case ScraperInstructionType.PageAction:
          lastInstructionInfo = pushInstructionInfo({
            type: instruction.type,
            action: instruction.action,
          })
          await this.performPageAction(context, instruction.action)
          break

        case ScraperInstructionType.Condition:
          {
            this.logger.info({ msg: "Checking condition", condition: instruction.if })

            const info = pushInstructionInfo({
              type: instruction.type,
              condition: instruction.if,
              isMet: false as boolean,
            })
            const isMet = await this.checkCondition(context, instruction.if)
            info.instructionInfo.isMet = isMet
            lastInstructionInfo = info

            const conditionalInstructionsResult = isMet
              ? await this.executeInstructions(context, instruction.then, level + 1)
              : instruction.else
                ? await this.executeInstructions(context, instruction.else, level + 1)
                : null

            if (conditionalInstructionsResult?.type === ScraperInstructionType.Jump) {
              instruction = conditionalInstructionsResult
              break
            }
          }
          break

        case ScraperInstructionType.SaveData:
          {
            lastInstructionInfo = pushInstructionInfo({
              type: instruction.type,
              dataKey: instruction.dataKey,
              value: instruction.value,
            })
            const scraperValue = await getScraperValue(context, instruction.value)
            await context.dataBridge.set(instruction.dataKey, scraperValue)
            context.executionInfo.push({
              type: ScraperInstructionsExecutionInfoType.ExternalDataOperation,
              operation: {
                type: "set",
                key: instruction.dataKey,
                value: scraperValue,
              },
            })
          }
          break
        case ScraperInstructionType.DeleteData:
          lastInstructionInfo = pushInstructionInfo({
            type: instruction.type,
            dataKey: instruction.dataKey,
          })
          await context.dataBridge.delete(instruction.dataKey)
          context.executionInfo.push({
            type: ScraperInstructionsExecutionInfoType.ExternalDataOperation,
            operation: {
              type: "delete",
              key: instruction.dataKey,
            },
          })
          break

        case ScraperInstructionType.Marker:
          lastInstructionInfo = pushInstructionInfo({
            type: instruction.type,
            name: instruction.name,
          })
          continue
        case ScraperInstructionType.Jump:
          lastInstructionInfo = pushInstructionInfo({
            type: instruction.type,
            markerName: instruction.markerName,
          })
          break
      }

      await context.page.waitForNetworkIdle({
        timeout: 60_000,
        signal: this.abortController.signal,
      })

      lastInstructionInfo.duration = performance.now() - instructionStartTime
      if (lastInstructionInfo.url !== context.page.url()) {
        lastInstructionInfo.url = { from: instructionStartUrl, to: context.page.url() }
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

  private async performPageAction(context: ScraperExecutionContext, action: PageAction) {
    this.logger.info({ msg: "Performing action", action })
    switch (action.type) {
      case PageActionType.Wait:
        await wait(action.duration)
        break
      case PageActionType.Navigate:
        await context.page.goto(action.url, { timeout: 60_000 })
        break
      case PageActionType.Click: {
        const handle = await getElementHandle(context.page, action.selector, true)
        await handle.click({
          delay: randomInt(1, 4),
        })
        break
      }
      case PageActionType.Type: {
        const handle = await getElementHandle(context.page, action.selector, true)
        if (action.clearBeforeType) {
          await handle.evaluate((el) => {
            if (el instanceof HTMLInputElement) {
              el.value = ""
            }
          })
        }

        const value = await getScraperValue(context, action.value)
        if (value) {
          await handle.type(value, {
            delay: randomInt(1, 4),
          })
        }
        break
      }
    }
  }

  private async checkCondition(context: ScraperExecutionContext, condition: ScraperCondition) {
    try {
      switch (condition.type) {
        case ScraperConditionType.IsVisible: {
          const handle = await getElementHandle(context.page, condition.selector)
          return !!(await handle?.isVisible())
        }
        case ScraperConditionType.TextEquals: {
          const value = await getScraperValue(context, condition.valueSelector)
          if (value === null || value === undefined) {
            return false
          }
          if (typeof condition.text === "string") {
            return value === condition.text
          }
          return condition.text.test(value)
        }
      }
    } catch (error) {
      this.logger.fatal(error)
      return false
    }
  }
}
