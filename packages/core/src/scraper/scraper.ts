import {
  assert,
  defaultPreferences,
  type ScraperInstructions,
  type ScraperInstructionsExecutionInfo,
  ScraperInstructionsExecutionInfoType,
  ScraperState,
  type ScraperType,
  type SimpleLogger,
  wait,
} from "@web-scraper/common"
import EventEmitter from "node:events"
import {
  firefox,
  chromium,
  type LaunchOptions,
  type Browser,
  type Page,
} from "playwright"
import { SmartLocalization } from "./ai/localization/smart-localization"
import { AutonomousAgent } from "./ai/agent/autonomous-agent"
import type { DataBridge } from "./data-helper"
import { checkNetworkConnection } from "./helpers"
import { ExecutionPages, type PageSnapshot } from "./execution/execution-pages"
import { executeInstructions } from "./execution/instructions"
import { ScraperExecutionInfo } from "./execution/scraper-execution-info"

type ScraperOptions = Pick<ScraperType, "id" | "name"> & {
  logger?: SimpleLogger
  dumpError: (error: unknown, pageSnapshots: PageSnapshot[]) => void

  /** Used for testing purposes */
  noInit?: boolean

  proxy?: string

  viewport?: { width: number; height: number }

  localizationModel?: string
  localizationSystemPrompt?: string
  navigationModel?: string
  userDataDir?: string
  executablePath?: string
  headless?: boolean
}

type Metadata = Record<string, unknown>

type CommonExecutionOptions<MetadataType extends Metadata | undefined> = {
  pageMiddleware?: (page: Page) => void | Promise<void>
  metadata?: MetadataType
  allowOfflineExecution?: boolean
}

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
  protected static instances = new Map<
    `${number}-${string}`,
    Scraper<Metadata | undefined>
  >()

  public static destroyAll() {
    for (const instance of Scraper.instances.values()) {
      void instance.destroy()
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

  private readonly logger: SimpleLogger
  private readonly dumpError: ScraperOptions["dumpError"]
  private readonly defaultViewport: { width: number; height: number }
  private readonly localization: SmartLocalization
  private readonly agent: AutonomousAgent

  private initPromise: Promise<Browser> | null = null

  private browser: Browser | null = null
  private abortController = new AbortController()

  private _state = ScraperState.Pending
  private activeExecutionInfo: ScraperExecutionInfo | null = null
  private _currentlyExecutingInstruction: ScraperInstructions[number] | null =
    null

  constructor(private readonly options: Readonly<ScraperOptions>) {
    super()

    const {
      id,
      name,
      logger,
      dumpError,
      proxy,
      viewport,
      userDataDir,
      executablePath,
      headless,
    } = options

    this.logger = logger ?? {
      ...console,
      fatal: console.error,
    }

    this.dumpError = dumpError ?? (() => void 0)

    this.defaultViewport = {
      width: viewport?.width ?? defaultPreferences.viewportWidth.value,
      height: viewport?.height ?? defaultPreferences.viewportHeight.value,
    }

    const localizationLogger =
      "child" in this.logger && typeof this.logger.child === "function"
        ? this.logger.child({
            scraper: `${id}-${name}`,
            ollama: true,
            localization: true,
          })
        : this.logger

    this.localization = new SmartLocalization(localizationLogger, {
      systemPrompt: options.localizationSystemPrompt,
      model: options.localizationModel,
    })

    const navigationLogger: SimpleLogger =
      "child" in this.logger && typeof this.logger.child === "function"
        ? this.logger.child({
            scraper: `${id}-${name}`,
            ollama: true,
            navigation: true,
          })
        : this.logger

    this.agent = new AutonomousAgent(navigationLogger, {
      model: options.navigationModel,
    })

    assert(
      !Scraper.instances.has(this.identifier),
      "Scraper with this ID already exists",
    )

    Scraper.instances.set(this.identifier, this)

    if (!options.noInit) {
      this.init({
        headless,
        userDataDir,
        executablePath,
        proxy,
      }).catch((error) => {
        this.logger.error(error)
        void this.destroy()
      })
    }
  }

  private init(options: {
    headless?: boolean
    userDataDir?: string
    executablePath?: string
    proxy?: string
  }) {
    if (this.browser) {
      return Promise.resolve(this.browser)
    }

    if (this.initPromise) {
      return this.initPromise
    }

    type BrowserLaunchOptions =
      | LaunchOptions
      | Parameters<
          | typeof chromium.launchPersistentContext
          | typeof firefox.launchPersistentContext
        >[1]
    const headless =
      options?.headless ??
      (!process.env.DISPLAY && !process.env.WAYLAND_DISPLAY)
    const executablePath = options.executablePath || "/usr/bin/chromium"
    // "/home/aktyn/.cache/invisible-playwright/firefox-13/firefox"
    const launchOptions: BrowserLaunchOptions = {
      headless,
      args: [
        // "--disable-infobars",
        // "--window-size=1920,1080",
        // "--lang=en-US",
        // "--accept-language=en-US",
        // "--ignore-certificate-errors",
        // "--disable-web-security",
        process.env.CI ? "--no-sandbox" : undefined,
      ].filter((arg) => typeof arg === "string"),
      executablePath,
      proxy: options.proxy ? { server: options.proxy } : undefined,
      // viewport: { width: 1920, height: 1080 },
      env: {
        STEALTHFOX_SEED: "44",
        STEALTHFOX_TIMEZONE: "Europe/Warsaw",
      },
    }

    const browserType = executablePath.toLowerCase().endsWith("firefox")
      ? firefox
      : chromium

    this.logger.info({
      msg: `Launching "${browserType === chromium ? "chromium" : "firefox"}" browser with options`,
      launchOptions,
    })

    this.initPromise = new Promise<Browser>((resolve, reject) => {
      const launchPromise = options.userDataDir
        ? browserType
            .launchPersistentContext(options.userDataDir, launchOptions)
            // .launch(launchOptions)
            .then((ctx) => ctx.browser())
        : browserType.launch(launchOptions)

      launchPromise
        .then((browser) => {
          if (!browser) {
            reject(new Error("Browser is null"))
            return
          }

          resolve(browser)

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

        browser.on("disconnected", () => {
          if (this.destroyed) {
            return
          }

          this.logger.error(
            `Browser disconnected unexpectedly, destroying scraper ${this.identifier}`,
          )
          void this.destroy()
        })
      })
      .catch((error) => this.logger.error(error))
      .finally(() => {
        this.initPromise = null
      })

    return this.initPromise
  }

  isReady() {
    return this.initPromise === null && this.browser !== null
  }

  get id() {
    return this.options.id
  }
  get name() {
    return this.options.name
  }

  private get identifier() {
    return `${this.id}-${this.name}` as const
  }

  get destroyed() {
    return !Scraper.instances.has(this.identifier)
  }

  destroy() {
    assert(!this.destroyed, "Scraper already destroyed")

    Scraper.instances.delete(this.identifier)

    this.abortController.abort("Scraper instance destroyed")

    let promise = Promise.resolve()

    if (this.browser) {
      promise = this.browser
        .close()
        .then(() => this.logger.info("Browser closed"))
        .catch((error) => this.logger.error(error))
      this.browser = null
    }
    this.initPromise = null
    this.state = ScraperState.Exited

    this.emit("destroy")

    return promise
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

  async execute(
    instructions: ScraperInstructions,
    dataBridge: DataBridge,
    options?: MetadataType extends undefined
      ? CommonExecutionOptions<MetadataType> | undefined
      : CommonExecutionOptions<MetadataType>,
  ): Promise<ScraperExecutionInfo>

  async execute(
    instructions: ScraperInstructions,
    dataBridge: DataBridge,
    options: CommonExecutionOptions<MetadataType> = {},
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

    if (!options.allowOfflineExecution) {
      if (!(await checkNetworkConnection())) {
        this.logger.warn(
          "No network connection available and offline execution is not allowed",
        )

        this.state = ScraperState.WaitingForNetwork

        do {
          await wait(10_000)
        } while (!(await checkNetworkConnection()))

        this.logger.info("Network connection restored")
      }
    }

    this.emit("executionStarted")
    this.state = ScraperState.Executing

    if (!this.browser) {
      this.browser = await this.init({
        headless: this.options.headless,
        userDataDir: this.options.userDataDir,
        executablePath: this.options.executablePath,
        proxy: this.options.proxy,
      })
    }

    assert(!this.destroyed, "Cannot execute scraper because it is destroyed")

    const startTime = Date.now()

    const pages = new ExecutionPages(this.browser, {
      proxy: this.options.proxy,
      viewport: this.defaultViewport,
      logger: this.logger,
      executionInfo,
      pageMiddleware: options?.pageMiddleware,
    })

    executionInfo.on("update", (info) => this.emit("executionUpdate", info))

    try {
      await executeInstructions(
        {
          scraperIdentifier: this.identifier,
          pages,
          dataBridge,
          executionInfo,
          logger: this.logger,
          abortController: this.abortController,
          ai: {
            localization: this.localization,
            navigation: this.agent,
          },
        },
        instructions,
        (instruction) => {
          this._currentlyExecutingInstruction = instruction
          this.emit("executingInstruction", instruction)

          // void pages.getPageSnapshots().then((snapshot) => {
          //   if (snapshot) {
          //     this.dumpError(`debug-${instruction.type}`, snapshot)
          //   }
          // })
        },
        undefined,
      )

      if (!this.destroyed) {
        executionInfo.push({
          type: ScraperInstructionsExecutionInfoType.Success,
          summary: {
            duration: Date.now() - startTime,
          },
        })
      } else {
        return executionInfo
      }
    } catch (error) {
      this.logger.error(error)
      executionInfo.push({
        type: ScraperInstructionsExecutionInfoType.Error,
        errorMessage: error instanceof Error ? error.message : String(error),
        summary: {
          duration: Date.now() - startTime,
        },
      })

      this.dumpError(error, await pages.getPageSnapshots())
    }

    executionInfo.flush()

    this.emit(
      "executionFinished",
      executionInfo,
      options.metadata as MetadataType,
    )
    this.state = ScraperState.Idle

    await pages.closeAll()

    this.activeExecutionInfo = null
    this._currentlyExecutingInstruction = null

    return executionInfo
  }
}
