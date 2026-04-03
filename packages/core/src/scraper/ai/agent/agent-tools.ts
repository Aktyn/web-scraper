import {
  type ScraperDataKey,
  defaultPreferences,
  PageActionType,
  randomInt,
  wait,
  type Coordinates,
  type PageAction,
  type SimpleLogger,
} from "@web-scraper/common"
import ollama, { type Message, type Tool } from "ollama"
import type { DataBridge, DataBridgeValue } from "../../data-helper"
import type { ScraperPageContext } from "../../execution/execution-pages"
import type { ScreenshotTool } from "../common/screenshot-tool"
import {
  type PreciseClickOptions,
  findAndClick,
  findAndFocus,
  preciseClick,
} from "../../execution/page-actions"
import type { ScrollOptions } from "ghost-cursor"
import { systemActions } from "../../../system-actions"

export enum AgentToolName {
  // Common
  ADD_NOTE = "add_note",
  GET_NOTES = "get_notes",
  CLEAR_NOTES = "clear_notes",

  // Page context requests
  GET_SCREENSHOT = "get_screenshot",
  GET_CURRENT_URL = "get_current_url",

  // Page interaction
  CLICK = "click",
  TYPE = "type",
  SCROLL = "scroll",
  NAVIGATE = "navigate",
  RUN_JAVASCRIPT = "run_javascript",

  // Database
  GET_FROM_DATABASE = "get_from_database",
  INSERT_INTO_DATABASE = "insert_into_database",

  SHOW_NOTIFICATION = "show_notification",

  ABORT = "abort",
  FINISH = "finish",
}

type AgentToolResponse = Pick<Message, "content" | "images">

export type AgentToolContext = {
  logger: SimpleLogger
  pageAction: PageAction & { type: PageActionType.RunAutonomousAgent }
  pageContext: ScraperPageContext
  dataBridge: DataBridge
  performCommonPageAction: (pageAction: PageAction) => Promise<void>
  screenshotTool: ScreenshotTool
  notes: string[]
}

type AgentToolArgumentsMap = {
  [AgentToolName.ADD_NOTE]: { content: string }
  [AgentToolName.GET_NOTES]: null
  [AgentToolName.CLEAR_NOTES]: null

  [AgentToolName.GET_SCREENSHOT]: null
  [AgentToolName.GET_CURRENT_URL]: null

  [AgentToolName.CLICK]: {
    coordinates?: Coordinates
    selector?: string
  }
  [AgentToolName.TYPE]: {
    coordinates?: Coordinates
    selector?: string
    value: string
    pressEnter?: boolean // Click enter after typing
  }
  /** Scroll vertically by 1 screen height */
  [AgentToolName.SCROLL]: { direction: "up" | "down" }
  [AgentToolName.NAVIGATE]: { url: string }
  [AgentToolName.RUN_JAVASCRIPT]: { code: string }

  [AgentToolName.GET_FROM_DATABASE]: { key: ScraperDataKey }
  [AgentToolName.INSERT_INTO_DATABASE]: {
    items: Array<{
      key: ScraperDataKey
      value: DataBridgeValue
    }>
  }

  [AgentToolName.SHOW_NOTIFICATION]: { content: string }

  [AgentToolName.ABORT]: { reason: string }
  [AgentToolName.FINISH]: { answer: string }
}

export const AgentToolFunctions: {
  [key in AgentToolName]: (
    args: AgentToolArgumentsMap[key],
    context: AgentToolContext,
  ) => AgentToolResponse | Promise<AgentToolResponse>
} = {
  [AgentToolName.ADD_NOTE]: ({ content }, { notes }) => {
    notes.push(content)
    return { content: `Note added. Current number of notes: ${notes.length}` }
  },
  [AgentToolName.GET_NOTES]: (_, { notes }) => {
    return {
      content: notes.join("\n"),
    }
  },
  [AgentToolName.CLEAR_NOTES]: (_, { notes }) => {
    notes.length = 0
    return { content: "Notes cleared" }
  },

  [AgentToolName.GET_SCREENSHOT]: async (_, { screenshotTool }) => {
    const { resized } = await screenshotTool.takeScreenshot()
    const encodedImage = await ollama.encodeImage(resized.data)

    return {
      content: `Screenshot resolution: ${resized.width}x${resized.height}`,
      images: [encodedImage],
    }
  },
  [AgentToolName.GET_CURRENT_URL]: async (_, { pageContext }) => {
    return { content: pageContext.page.url() }
  },

  [AgentToolName.CLICK]: async (
    { coordinates, selector },
    { pageContext, pageAction, screenshotTool, logger },
  ) => {
    const startUrl = pageContext.page.url()

    try {
      const clickOptions: PreciseClickOptions = {
        useGhostCursor: pageAction.useGhostCursor,
        waitForNavigation: true,
      }

      if (coordinates) {
        const transformedCoordinates =
          screenshotTool.transformCoordinates(coordinates)
        if (!transformedCoordinates) {
          return { content: "Incorrect coordinates" }
        }
        await preciseClick(
          pageContext,
          transformedCoordinates,
          clickOptions,
          logger,
        )
      } else if (selector) {
        const clicked = await findAndClick(
          pageContext,
          selector,
          clickOptions,
          logger,
        )
        if (!clicked) {
          return { content: "Element not found" }
        }
      }
    } catch (error) {
      logger.error({ msg: "Failed to click element", error })

      return {
        content: `Failed to click element. Error: ${error instanceof Error ? error.message : String(error)}.`,
      }
    }

    if (startUrl === pageContext.page.url()) {
      return { content: "Element clicked successfully" }
    } else {
      return {
        content: `Element clicked and the page URL has changed to ${pageContext.page.url()}`,
      }
    }
  },
  [AgentToolName.TYPE]: async (
    { coordinates, selector, value, pressEnter },
    { pageContext, pageAction, screenshotTool, logger },
  ) => {
    try {
      const clickOptions: PreciseClickOptions = {
        useGhostCursor: pageAction.useGhostCursor,
        waitForNavigation: true,
      }

      if (coordinates) {
        const transformedCoordinates =
          screenshotTool.transformCoordinates(coordinates)
        if (!transformedCoordinates) {
          return { content: "Incorrect coordinates" }
        }
        await preciseClick(
          pageContext,
          transformedCoordinates,
          clickOptions,
          logger,
        )
      } else if (selector) {
        const clicked = await findAndFocus(pageContext, selector)
        if (!clicked) {
          return { content: "Element not found" }
        }
      }
    } catch (error) {
      logger.error({ msg: "Failed to find element", error })

      return { content: "Element not found" }
    }

    // Clear input field
    const modifier = process.platform === "darwin" ? "Meta" : "Control"
    await pageContext.page.keyboard.down(modifier)
    await wait(randomInt(10, 50))
    await pageContext.page.keyboard.press("KeyA")
    await wait(randomInt(10, 50))
    await pageContext.page.keyboard.up(modifier)
    await wait(randomInt(50, 100))
    await pageContext.page.keyboard.press("Backspace")
    await wait(randomInt(50, 100))

    await pageContext.page.keyboard.type(value, {
      delay: randomInt(1, 4),
    })

    if (pressEnter) {
      const startUrl = pageContext.page.url()

      await wait(randomInt(100, 500))
      await pageContext.page.keyboard.press("Enter")

      try {
        await pageContext.page.waitForNavigation({
          waitUntil: "networkidle0",
          timeout: 20_000,
        })
      } catch (error) {
        logger.error({ msg: "Failed to wait for navigation", error })
      }

      if (startUrl !== pageContext.page.url()) {
        return {
          content: `Text was typed, enter pressed and page URL has changed to ${pageContext.page.url()}`,
        }
      } else {
        return {
          content: `Text was typed, enter pressed but page URL has not changed`,
        }
      }
    }

    return { content: "Text was typed successfully" }
  },
  [AgentToolName.SCROLL]: async ({ direction }, { pageContext }) => {
    const viewport = pageContext.page.viewport() ?? {
      width: defaultPreferences.viewportWidth.value,
      height: defaultPreferences.viewportHeight.value,
    }
    const scrollOptions: ScrollOptions = {
      scrollSpeed: 50,
      scrollDelay: randomInt(100, 500),
    }

    switch (direction) {
      case "down":
        await pageContext.cursor.scroll({ y: viewport.height }, scrollOptions)
        return { content: "Scrolled down" }
      case "up":
        await pageContext.cursor.scroll({ y: -viewport.height }, scrollOptions)
        return { content: "Scrolled up" }
    }
  },
  [AgentToolName.NAVIGATE]: async ({ url }, { performCommonPageAction }) => {
    await performCommonPageAction({
      type: PageActionType.Navigate,
      url,
    })

    return { content: `Navigated to ${url}` }
  },
  [AgentToolName.RUN_JAVASCRIPT]: async ({ code }, { pageContext }) => {
    let func: ((...args: unknown[]) => void) | string
    try {
      func = new Function("...args", `return (${code})(...args)`) as never
    } catch {
      func = code
    }
    const result = await pageContext.page.evaluate(func)

    return { content: JSON.stringify(result) }
  },

  [AgentToolName.GET_FROM_DATABASE]: async (
    { key },
    { dataBridge, logger },
  ) => {
    const returnedValue = await dataBridge.get(key)
    logger.info({
      msg: `Value fetched from "${key}"`,
      value: returnedValue,
    })

    return { content: JSON.stringify(returnedValue) }
  },
  [AgentToolName.INSERT_INTO_DATABASE]: async (
    { items },
    { dataBridge, logger },
  ) => {
    try {
      const groups = items.reduce((acc, item) => {
        const [sourceName, columnName] = item.key.split(".")
        const items = acc.get(sourceName) ?? []
        if (items.some((i) => i.columnName === columnName)) {
          throw new Error(
            `Duplicate column "${columnName}". Use separate tool calls to insert multiple rows. Each call of "${AgentToolName.INSERT_INTO_DATABASE}" is meant to insert exactly one row. Each item in parameters corresponds to a different column in the same row.`,
          )
        }
        items.push({
          columnName,
          value: item.value,
        })
        acc.set(sourceName, items)

        return acc
      }, new Map<string, Array<{ columnName: string; value: DataBridgeValue }>>())

      const feedback: string[] = []

      for (const [dataSourceName, items] of groups.entries()) {
        logger.info({
          msg: "Saving data batch",
          dataSourceName,
          items,
        })
        await dataBridge.setMany(dataSourceName, items)
        feedback.push(`Successfully inserted into table "${dataSourceName}"`)
      }

      return { content: feedback.join("\n") }
    } catch (error) {
      logger.error({ msg: "Failed to insert into database", error })

      return {
        content: `Failed to insert into database. Error: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  },

  [AgentToolName.SHOW_NOTIFICATION]: ({ content }) => {
    systemActions.showNotification(content)

    return { content: "Notification shown" }
  },

  [AgentToolName.ABORT]: ({ reason }) => {
    throw new Error(`Agent aborted task. Reason: "${reason}"`)
  },
  [AgentToolName.FINISH]: ({ answer }) => {
    return { content: answer }
  },
}

type MapTypeName<T> = T extends undefined
  ? never
  : T extends string
    ? "string"
    : T extends number
      ? "number" | "integer"
      : T extends boolean
        ? "boolean"
        : T extends Array<unknown>
          ? "array"
          : T extends null
            ? "null"
            : T extends object
              ? "object"
              : never

type ToolParameters = NonNullable<Tool["function"]["parameters"]>
type AgentTool<T extends AgentToolName> = Tool & {
  function: {
    name: T
    parameters?: AgentToolArgumentsMap[T] extends null
      ? never
      : ToolParameters & {
          properties?: {
            [key in keyof AgentToolArgumentsMap[T]]: NonNullable<
              ToolParameters["properties"]
            >[string] & { type: MapTypeName<AgentToolArgumentsMap[T][key]> }
          }
        }
  }
}

export const AGENT_TOOLS: { [key in AgentToolName]: AgentTool<key> } = {
  [AgentToolName.ADD_NOTE]: {
    type: "function",
    function: {
      name: AgentToolName.ADD_NOTE,
      description: "Add new note for later reference",
      parameters: {
        type: "object",
        required: ["content"],
        properties: {
          content: {
            type: "string",
            description: "Content of the note",
          },
        },
      },
    },
  },

  [AgentToolName.GET_NOTES]: {
    type: "function",
    function: {
      name: AgentToolName.GET_NOTES,
      description: "Get all saved notes",
    },
  },

  [AgentToolName.CLEAR_NOTES]: {
    type: "function",
    function: {
      name: AgentToolName.CLEAR_NOTES,
      description: "Clear all saved notes",
    },
  },

  [AgentToolName.GET_SCREENSHOT]: {
    type: "function",
    function: {
      name: AgentToolName.GET_SCREENSHOT,
      description: "Get screenshot of the current page for visual analysis",
    },
  },

  [AgentToolName.GET_CURRENT_URL]: {
    type: "function",
    function: {
      name: AgentToolName.GET_CURRENT_URL,
      description: "Get the URL of the current page",
    },
  },

  [AgentToolName.CLICK]: {
    type: "function",
    function: {
      name: AgentToolName.CLICK,
      description: "Click an element by coordinates or CSS selector",
      parameters: {
        type: "object",
        properties: {
          coordinates: {
            type: "object",
            description: "Coordinates to click. Requires x and y properties.",
          },
          selector: {
            type: "string",
            description: "CSS selector to click",
          },
        },
      },
    },
  },

  [AgentToolName.TYPE]: {
    type: "function",
    function: {
      name: AgentToolName.TYPE,
      description:
        "Type text into an element by coordinates or CSS selector after focusing it.",
      parameters: {
        type: "object",
        required: ["value"],
        properties: {
          coordinates: {
            type: "object",
            description:
              "Coordinates to click and type into. Requires x and y properties.",
          },
          selector: {
            type: "string",
            description: "CSS selector of the input field to type into",
          },
          value: {
            type: "string",
            description: "Text to type",
          },
          pressEnter: {
            type: "boolean",
            description: "Whether to additionally press Enter after typing",
          },
        },
      },
    },
  },

  [AgentToolName.SCROLL]: {
    type: "function",
    function: {
      name: AgentToolName.SCROLL,
      description: "Scroll the page up or down by 1 screen height",
      parameters: {
        type: "object",
        required: ["direction"],
        properties: {
          direction: {
            type: "string",
            description: "Direction to scroll. Either 'up' or 'down'.",
            enum: ["up", "down"],
          },
        },
      },
    },
  },

  [AgentToolName.NAVIGATE]: {
    type: "function",
    function: {
      name: AgentToolName.NAVIGATE,
      description: "Navigate current page to a new URL",
      parameters: {
        type: "object",
        required: ["url"],
        properties: {
          url: {
            type: "string",
            description: "URL to navigate to",
          },
        },
      },
    },
  },

  [AgentToolName.RUN_JAVASCRIPT]: {
    type: "function",
    function: {
      name: AgentToolName.RUN_JAVASCRIPT,
      description: "Run JavaScript code in the browser context.",
      parameters: {
        type: "object",
        required: ["code"],
        properties: {
          code: {
            type: "string",
            description:
              "JavaScript code string to evaluate. e.g: '() => document.title'",
          },
        },
      },
    },
  },

  [AgentToolName.GET_FROM_DATABASE]: {
    type: "function",
    function: {
      name: AgentToolName.GET_FROM_DATABASE,
      description: "Read a value from the database",
      parameters: {
        type: "object",
        required: ["key"],
        properties: {
          key: {
            type: "string",
            description:
              "Key of the value to read, formatted as 'tableName.columnName'",
          },
        },
      },
    },
  },

  [AgentToolName.INSERT_INTO_DATABASE]: {
    type: "function",
    function: {
      name: AgentToolName.INSERT_INTO_DATABASE,
      description: "Insert multiple items into the database",
      parameters: {
        type: "object",
        required: ["items"],
        properties: {
          items: {
            type: "array",
            description:
              "Array of items to insert. Each item represents a column value.",
            items: {
              type: "object",
              properties: {
                key: {
                  type: "string",
                  description:
                    "Key to save data to, formatted as 'tableName.columnName'",
                },
                value: {
                  type: "string",
                  description: "Value to insert",
                },
              },
            },
          },
        },
      },
    },
  },

  [AgentToolName.SHOW_NOTIFICATION]: {
    type: "function",
    function: {
      name: AgentToolName.SHOW_NOTIFICATION,
      description: "Show a system notification to the user",
      parameters: {
        type: "object",
        required: ["content"],
        properties: {
          content: {
            type: "string",
            description: "Notification content",
          },
        },
      },
    },
  },

  [AgentToolName.ABORT]: {
    type: "function",
    function: {
      name: AgentToolName.ABORT,
      description:
        "Abort the agent execution immediately if unrecoverable error occurs",
      parameters: {
        type: "object",
        required: ["reason"],
        properties: {
          reason: {
            type: "string",
            description: "Explanation for aborting",
          },
        },
      },
    },
  },

  [AgentToolName.FINISH]: {
    type: "function",
    function: {
      name: AgentToolName.FINISH,
      description:
        "Finish the execution successfully, optionally returning an answer.",
      parameters: {
        type: "object",
        properties: {
          answer: {
            type: "string",
            description: "Final answer string to return, if any.",
          },
        },
      },
    },
  },
}
