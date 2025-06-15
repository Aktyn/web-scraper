import useProxy from "@lem0-packages/puppeteer-page-proxy"
import {
  assert,
  deepMerge,
  type PageAction,
  PageActionType,
  randomInt,
  runUnsafe,
  type ScraperCondition,
  ScraperConditionType,
  type ScraperInstructionInfo,
  type ScraperInstructions,
  type ScraperInstructionsExecutionInfo,
  ScraperInstructionsExecutionInfoType,
  ScraperInstructionType,
  ScraperState,
  type ScraperType,
  type SimpleLogger,
  wait,
} from "@web-scraper/common"
import { createCursor, getRandomPagePoint } from "ghost-cursor"
import EventEmitter from "node:events"
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker"
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import puppeteerRealBrowser from "puppeteer-real-browser"
import puppeteer, {
  type Browser,
  type LaunchOptions,
  type Page,
  type Viewport,
} from "rebrowser-puppeteer"
import { performSystemAction } from "../system-actions"
import { detectAndSolveCaptcha } from "./captcha-solver"
import {
  type DataBridge,
  getScraperValue,
  replaceSpecialStrings,
} from "./data-helper"
import { saveScreenshot, type ScraperExecutionContext } from "./helpers"
import { scrollToBottom } from "./page-actions"
import { ScraperExecutionInfo } from "./scraper-execution-info"
import { getElementHandle } from "./selectors"

const defaultViewport: Viewport = { width: 1280, height: 720 }

type ScraperOptions = Pick<ScraperType, "id" | "name"> & {
  logger?: SimpleLogger

  /** Used for testing purposes */
  noInit?: boolean

  proxy?: string
} & Partial<LaunchOptions>

type Metadata = Record<string, unknown>

interface ScraperEvents<MetadataType extends Metadata | undefined = undefined> {
  destroy: () => void
  stateChange: (state: ScraperState, previousState: ScraperState) => void
  executionStarted: () => void
  executionFinished: (
    executionInfo: ScraperExecutionInfo,
    metadata: MetadataType,
  ) => void
  executionUpdate: (
    executionInfo: ScraperInstructionsExecutionInfo[number],
  ) => void
  executingInstruction: (instruction: ScraperInstructions[number]) => void
}

export class Scraper<
  MetadataType extends Metadata | undefined = undefined,
> extends EventEmitter {
  private static instances = new Map<
    `${number}-${string}`,
    Scraper<Metadata | undefined>
  >()

  public static destroyAll() {
    for (const instance of Scraper.instances.values()) {
      instance.destroy()
    }
    assert(
      Scraper.instances.size === 0,
      "Scraper instances have not been destroyed correctly",
    )
  }

  public static getInstances() {
    return Array.from(Scraper.instances.values())
  }

  public static getInstance(identifier: `${number}-${string}`) {
    return Scraper.instances.get(identifier) ?? null
  }

  private static emptyPageUrl = "about:blank"

  private readonly logger: SimpleLogger
  private readonly proxy: string | undefined

  private initPromise: Promise<Browser> | null = null

  private browser: Browser | null = null
  private abortController = new AbortController()

  private _state = ScraperState.Pending
  private activeExecutionInfo: ScraperExecutionInfo | null = null
  private _currentlyExecutingInstruction: ScraperInstructions[number] | null =
    null

  constructor(public readonly options: ScraperOptions) {
    super()

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, name, logger, proxy, ...browserOptions } = options

    this.logger = logger ?? {
      ...console,
      fatal: console.error,
    }

    this.proxy = proxy

    assert(
      !Scraper.instances.has(this.identifier),
      "Scraper with this ID already exists",
    )

    Scraper.instances.set(this.identifier, this)

    if (!options.noInit) {
      this.init(browserOptions).catch((error) => {
        this.logger.error(error)
        this.destroy()
      })
    }
  }

  private init(options: Partial<LaunchOptions>) {
    if (this.browser) {
      return Promise.resolve(this.browser)
    }

    if (this.initPromise) {
      return this.initPromise
    }

    const headless = options?.headless ?? false
    const launchOptions = deepMerge(
      {
        downloadBehavior: { policy: "default" },
        headless,
        defaultViewport,
        args: [
          "--disable-infobars",
          "--window-size=1284,848",
          "--lang=en-US",
          "--accept-language=en-US",
          "--ignore-certificate-errors",
          process.env.CI ? "--no-sandbox" : undefined,
        ].filter((arg) => typeof arg === "string"),
        env: {
          ...process.env,
          LANGUAGE: "en-US",
        },
      },
      options ?? {},
    )

    this.logger.info({ msg: "Launching browser with options", launchOptions })

    this.initPromise = new Promise<Browser>((resolve, reject) => {
      const launchPromise =
        process.env.TEST === "true" ||
        process.env.VITEST === "true" ||
        process.env.CI === "true"
          ? puppeteer.launch(launchOptions)
          : puppeteerRealBrowser
              .connect({
                args: launchOptions.args ?? [],
                headless: !!launchOptions.headless,
                customConfig: {
                  chromePath: launchOptions.executablePath,
                  userDataDir: launchOptions.userDataDir || false,
                  chromeFlags: ["--enable-unsafe-webgpu"],
                },
                connectOption: {
                  defaultViewport,
                  downloadBehavior: { policy: "default" },
                },
                turnstile: false,
                plugins: [
                  AdblockerPlugin({ blockTrackers: true }),
                  StealthPlugin(),
                ],
              })
              .then((result) => result.browser)

      launchPromise
        .then((browser) => {
          resolve(browser as never)
          if (this.destroyed) {
            void browser.close()
          }
        })
        .catch((error) => {
          reject(error)
        })
    })

    this.initPromise
      .then((browser) => {
        this.browser = browser

        browser.once("disconnected", () => {
          if (this.destroyed) {
            return
          }

          this.logger.error(
            `Browser disconnected unexpectedly, destroying scraper ${this.identifier}`,
          )
          this.destroy()
        })
      })
      .catch(this.logger.error)
      .finally(() => {
        this.initPromise = null
      })

    return this.initPromise
  }

  isReady() {
    return this.initPromise === null && this.browser !== null
  }

  private get identifier() {
    return `${this.options.id}-${this.options.name}` as const
  }

  get destroyed() {
    return !Scraper.instances.has(this.identifier)
  }

  destroy() {
    assert(!this.destroyed, "Scraper already destroyed")

    Scraper.instances.delete(this.identifier)

    this.abortController.abort("Scraper instance destroyed")

    if (this.browser) {
      this.browser.removeAllListeners()
      void this.browser
        .close()
        .then(() => this.logger.info("Browser closed"))
        .catch(this.logger.error)
      this.browser = null
    }
    this.initPromise = null
    this.state = ScraperState.Exited

    this.emit("destroy")
  }

  override emit<E extends keyof ScraperEvents<MetadataType>>(
    event: E,
    ...args: Parameters<ScraperEvents<MetadataType>[E]>
  ): boolean {
    return super.emit(event, ...args)
  }

  on<E extends keyof ScraperEvents>(
    event: E,
    listener: ScraperEvents<MetadataType>[E],
  ) {
    return super.on(event, listener)
  }

  off<E extends keyof ScraperEvents>(
    event: E,
    listener: ScraperEvents<MetadataType>[E],
  ) {
    return super.off(event, listener)
  }

  get state() {
    if (this.destroyed) {
      return ScraperState.Exited
    }
    return this._state
  }

  set state(state: ScraperState) {
    if (this._state === ScraperState.Exited) {
      return
    }

    const previousState = this._state
    this._state = state
    this.emit("stateChange", state, previousState)
  }

  get executionInfo() {
    return this.activeExecutionInfo?.get() ?? []
  }

  get currentlyExecutingInstruction() {
    return this._currentlyExecutingInstruction
  }

  private async getPage() {
    assert(!!this.browser, "Browser not initialized")

    const firstPage = (await this.browser.pages()).at(0)

    const page =
      firstPage && firstPage.url() === Scraper.emptyPageUrl
        ? firstPage
        : await this.browser.newPage()

    try {
      const userAgent =
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
      if (userAgent) {
        this.logger.info(`Setting user agent to "${userAgent}"`)
        await page.setUserAgent(userAgent)
      }
    } catch (error) {
      this.logger.warn({ msg: "Failed to set user agent", error })
    }

    await page.evaluateOnNewDocument((lang) => {
      Object.defineProperty(navigator, "language", {
        get: function () {
          return lang
        },
      })
    }, "en-US")

    if (this.proxy) {
      await useProxy(page, this.proxy)

      // try {
      //   const lookupData = await useProxy.lookup(page)
      //   this.logger.info({ msg: "Proxy lookup", lookupData })
      // } catch (error) {
      //   this.logger.error({ msg: "Proxy lookup failed", error })
      // }
    }

    const cursor = createCursor(page, await getRandomPagePoint(page), true)
    cursor.toggleRandomMove(true)
    // if (process.env.NODE_ENV === "development") {
    //   await installMouseHelper(page)
    // }

    return { page, cursor }
  }

  async execute(
    instructions: ScraperInstructions,
    dataBridge: DataBridge,
    options?: MetadataType extends undefined
      ?
          | {
              pageMiddleware?: (page: Page) => void | Promise<void>
              leavePageOpen?: boolean
              metadata?: MetadataType
            }
          | undefined
      : {
          pageMiddleware?: (page: Page) => void | Promise<void>
          leavePageOpen?: boolean
          metadata: MetadataType
        },
  ): Promise<ScraperExecutionInfo>

  async execute(
    instructions: ScraperInstructions,
    dataBridge: DataBridge,
    options: {
      pageMiddleware?: (page: Page) => void | Promise<void>
      leavePageOpen?: boolean
      metadata?: MetadataType
    } = {},
  ) {
    const executionInfo = new ScraperExecutionInfo(instructions, dataBridge)
    this.activeExecutionInfo = executionInfo
    this._currentlyExecutingInstruction = null

    if (
      this.state !== ScraperState.Idle &&
      this.state !== ScraperState.Pending
    ) {
      this.logger.warn(
        "Scraper is not in idle or pending state. Aborting run request.",
      )
      executionInfo.push({
        type: ScraperInstructionsExecutionInfoType.Error,
        errorMessage: `Execution cancelled due to Scraper not being in idle or pending state. Current state: ${this.state}`,
        summary: {
          duration: 0,
        },
      })
      return executionInfo
    }

    this.emit("executionStarted")
    this.state = ScraperState.Executing

    if (!this.browser) {
      this.browser = await this.init(this.options)
    }

    const startTime = performance.now()
    const { page, cursor } = await this.getPage()
    if (options?.pageMiddleware) {
      await options.pageMiddleware(page)
    }

    executionInfo.on("update", (info) => this.emit("executionUpdate", info))

    try {
      await this.executeInstructions(
        {
          page,
          cursor,
          dataBridge,
          executionInfo,
          logger: this.logger,
          abortController: this.abortController,
        },
        instructions,
        undefined,
      )

      if (!this.destroyed) {
        executionInfo.push({
          type: ScraperInstructionsExecutionInfoType.Success,
          summary: {
            duration: performance.now() - startTime,
          },
        })
      }
    } catch (error) {
      this.logger.error(error)
      executionInfo.push({
        type: ScraperInstructionsExecutionInfoType.Error,
        errorMessage: error instanceof Error ? error.message : String(error),
        summary: {
          duration: performance.now() - startTime,
        },
      })
    }

    executionInfo.flush()

    this.emit(
      "executionFinished",
      executionInfo,
      options.metadata as MetadataType,
    )
    this.state = ScraperState.Idle

    if (!options?.leavePageOpen) {
      await runUnsafe(async () => {
        if (!this.browser) {
          return
        }

        const pages = await this.browser.pages()
        if (pages.length > 1) {
          await page.close()
        } else {
          await page.goto(Scraper.emptyPageUrl)
        }
      }, this.logger.error)
    }

    this.activeExecutionInfo = null
    this._currentlyExecutingInstruction = null

    return executionInfo
  }

  private async executeInstructions(
    context: ScraperExecutionContext,
    instructions: ScraperInstructions,
    level = 0,
  ): Promise<ScraperInstructions[number] | null> {
    assert(instructions.length > 0 || level > 0, "Instructions are empty")
    assert(
      level > 0 ||
        (instructions[0].type === ScraperInstructionType.PageAction &&
          instructions[0].action.type === PageActionType.Navigate),
      "First instruction must be a navigation action",
    )

    const pushInstructionInfo = <T extends ScraperInstructionInfo>(
      instructionInfo: T,
    ) => {
      const info = {
        type: ScraperInstructionsExecutionInfoType.Instruction,
        instructionInfo,
        url: context.page.url(),
        duration: 0,
      } satisfies ScraperInstructionsExecutionInfo[number] & {
        instructionInfo: T
      }
      context.executionInfo.push(info)
      return info
    }

    for (let i = 0; i < instructions.length; i++) {
      let instruction = instructions[i]

      const instructionStartUrl = context.page.url()
      const instructionStartTime = performance.now()
      let lastInstructionInfo: ScraperInstructionsExecutionInfo[number] | null =
        null

      this._currentlyExecutingInstruction = instruction
      this.emit("executingInstruction", instruction)

      if (process.env.NODE_ENV === "development" && i > 0) {
        await saveScreenshot(
          context.page,
          `${this.identifier}-before-${instruction.type}`,
        )
      }

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
            context.logger.info({
              msg: "Checking condition",
              condition: instruction.if,
            })

            const info = pushInstructionInfo({
              type: instruction.type,
              condition: instruction.if,
              isMet: false as boolean,
            })
            const isMet = await this.checkCondition(context, instruction.if)
            info.instructionInfo.isMet = isMet
            lastInstructionInfo = info

            const conditionalInstructionsResult = isMet
              ? await this.executeInstructions(
                  context,
                  instruction.then,
                  level + 1,
                )
              : instruction.else
                ? await this.executeInstructions(
                    context,
                    instruction.else,
                    level + 1,
                  )
                : null

            if (
              conditionalInstructionsResult?.type ===
              ScraperInstructionType.Jump
            ) {
              instruction = conditionalInstructionsResult
              break
            }
          }
          break

        case ScraperInstructionType.SaveData:
          {
            context.logger.info("Saving data to data bridge", {
              dataKey: instruction.dataKey,
              value: instruction.value,
            })

            lastInstructionInfo = pushInstructionInfo({
              type: instruction.type,
              dataKey: instruction.dataKey,
              value: instruction.value,
            })
            const scraperValue = await getScraperValue(
              context,
              instruction.value,
            )
            await context.dataBridge.set(instruction.dataKey, scraperValue)
            context.executionInfo.push(
              {
                type: ScraperInstructionsExecutionInfoType.ExternalDataOperation,
                operation: {
                  type: "set",
                  key: instruction.dataKey,
                  value: scraperValue,
                },
              },
              false,
            )
          }
          break
        case ScraperInstructionType.SaveDataBatch:
          {
            context.logger.info("Saving batch data to data bridge", {
              dataSourceName: instruction.dataSourceName,
              items: instruction.items,
            })

            lastInstructionInfo = pushInstructionInfo({
              type: instruction.type,
              dataSourceName: instruction.dataSourceName,
              items: instruction.items,
            })

            const items = await Promise.all(
              instruction.items.map(async (item) => ({
                columnName: item.columnName,
                value: await getScraperValue(context, item.value),
              })),
            )

            await context.dataBridge.setMany(instruction.dataSourceName, items)
            context.executionInfo.push(
              {
                type: ScraperInstructionsExecutionInfoType.ExternalDataOperation,
                operation: {
                  type: "setMany",
                  dataSourceName: instruction.dataSourceName,
                  items: items,
                },
              },
              false,
            )
          }
          break
        case ScraperInstructionType.DeleteData:
          context.logger.info("Deleting data from data bridge", {
            dataSourceName: instruction.dataSourceName,
          })

          lastInstructionInfo = pushInstructionInfo({
            type: instruction.type,
            dataSourceName: instruction.dataSourceName,
          })
          await context.dataBridge.delete(instruction.dataSourceName)
          context.executionInfo.push(
            {
              type: ScraperInstructionsExecutionInfoType.ExternalDataOperation,
              operation: {
                type: "delete",
                dataSourceName: instruction.dataSourceName,
              },
            },
            false,
          )
          break

        case ScraperInstructionType.Marker:
          context.logger.info("Marking position in scraper execution", {
            markerName: instruction.name,
          })

          lastInstructionInfo = pushInstructionInfo({
            type: instruction.type,
            name: instruction.name,
          })
          context.executionInfo.flush()
          continue
        case ScraperInstructionType.Jump:
          context.logger.info("Jumping to marker", {
            markerName: instruction.markerName,
          })

          lastInstructionInfo = pushInstructionInfo({
            type: instruction.type,
            markerName: instruction.markerName,
          })
          break

        case ScraperInstructionType.SystemAction:
          context.logger.info("Performing system action", {
            action: instruction.systemAction,
          })

          lastInstructionInfo = pushInstructionInfo({
            type: instruction.type,
            systemAction: instruction.systemAction,
          })

          await performSystemAction(instruction.systemAction)
          break
      }

      lastInstructionInfo.duration = performance.now() - instructionStartTime
      if (lastInstructionInfo.url !== context.page.url()) {
        lastInstructionInfo.url = {
          from: instructionStartUrl,
          to: context.page.url(),
        }
      }

      if (instruction.type === ScraperInstructionType.Jump) {
        i = instructions.findIndex(
          (marker) =>
            marker.type === ScraperInstructionType.Marker &&
            marker.name === instruction.markerName,
        )
        assert(
          level > 0 || i !== -1,
          `Marker "${instruction.markerName}" not found`,
        )

        if (i === -1) {
          context.logger.warn("Marker not found, returning to previous level")
          return instruction
        }
      }
    }

    if (process.env.NODE_ENV === "development") {
      await saveScreenshot(context.page, this.identifier)
    }

    return null
  }

  private async performPageAction(
    context: ScraperExecutionContext,
    action: PageAction,
  ) {
    context.logger.info({ msg: "Performing action", action })
    switch (action.type) {
      case PageActionType.Wait:
        await wait(action.duration)
        break
      case PageActionType.Navigate:
        try {
          await context.page.goto(
            await replaceSpecialStrings(action.url, context.dataBridge),
            {
              timeout: 30_000,
              waitUntil: "networkidle0",
              signal: context.abortController.signal,
            },
          )
        } catch (error) {
          context.logger.warn({ msg: "Navigation failed", error })
        }
        break
      case PageActionType.Click: {
        const handle = await getElementHandle(context, action.selectors, true)
        await handle.click({
          delay: randomInt(1, 4),
        })
        break
      }
      case PageActionType.Type: {
        const handle = await getElementHandle(context, action.selectors, true)
        if (action.clearBeforeType) {
          await handle.evaluate((el) => {
            if (el instanceof HTMLInputElement) {
              el.value = ""
            }
          })
        }

        const value = await getScraperValue(context, action.value)
        if (value) {
          await handle.type(value.toString(), {
            delay: randomInt(1, 4),
          })
        }
        break
      }
      case PageActionType.ScrollToBottom:
        await scrollToBottom(context)
        break
    }

    if (
      action.type !== PageActionType.Wait &&
      action.type !== PageActionType.Navigate
    ) {
      await this.waitForNetworkIdle(context)
    }

    await detectAndSolveCaptcha(context)
  }

  private async waitForNetworkIdle(context: ScraperExecutionContext) {
    try {
      await context.page.waitForNetworkIdle({
        timeout: 30_000,
        signal: context.abortController.signal,
      })
    } catch (error) {
      context.logger.warn({ msg: "Network idle timeout", error })
    }
  }

  private async checkCondition(
    context: ScraperExecutionContext,
    condition: ScraperCondition,
  ) {
    try {
      switch (condition.type) {
        case ScraperConditionType.IsVisible: {
          const handle = await getElementHandle(context, condition.selectors)
          return !!(await handle?.isVisible())
        }
        case ScraperConditionType.TextEquals: {
          const value = await getScraperValue(context, condition.valueSelector)
          if (value === null || value === undefined) {
            return false
          }
          if (typeof condition.text === "string") {
            return (
              value ===
              (await replaceSpecialStrings(condition.text, context.dataBridge))
            )
          }
          return new RegExp(condition.text.source, condition.text.flags).test(
            value.toString(),
          )
        }
      }
    } catch (error) {
      context.logger.fatal(error)
      return false
    }
  }
}
