import {
  type PageAction,
  type ScraperDataKey,
  type SimpleLogger,
  defaultPreferences,
  PageActionType,
  pick,
  randomInt,
  SystemActionType,
  wait,
} from "@web-scraper/common"
import type { ScrollOptions } from "ghost-cursor"
import ollama, {
  type ChatRequest,
  type ChatResponse,
  type Message,
} from "ollama"
import { z } from "zod"
import { performSystemAction } from "../../system-actions"
import type { DataBridge, DataBridgeValue } from "../data-helper"
import type { ScraperPageContext } from "../execution/execution-pages"
import { preciseClick } from "../execution/page-actions"
import {
  type Coordinates,
  checkModelAvailability,
  coordinatesInBounds,
  getAbsoluteCoordinates,
} from "./helpers"
import { resizeScreenshot } from "./image-processing"
import {
  type NavigationStep,
  getNavigationStepSchema,
  NavigationActionType,
} from "./schemas"

type RequestOptions = Partial<Pick<ChatRequest, "model" | "format">>

/** Specifies how many previous responses to include in the system prompt */
const lastResponsesCount = 10

/** Specifies how many times the same action can be repeated */
const maximumActionRepetitions = 3

export class AutonomousAgent {
  constructor(
    private readonly logger: SimpleLogger,
    private readonly requestOptions: RequestOptions = {},
  ) {}

  async run(
    action: PageAction & { type: PageActionType.RunAutonomousAgent },
    pageContext: ScraperPageContext,
    dataBridge: DataBridge,
    performCommonPageAction: (pageAction: PageAction) => Promise<void>,
  ): Promise<string> {
    const model =
      this.requestOptions.model || defaultPreferences.navigationModel.value

    const modelAvailable = await checkModelAvailability(model)

    if (!modelAvailable) {
      throw new Error(
        `Model "${model}" is not available. It must be pulled from Ollama first.`,
      )
    }

    let dataBridgeSchema: Record<string, string> | null =
      await dataBridge.getSchema()
    if (JSON.stringify(dataBridgeSchema) === "{}") {
      dataBridgeSchema = null
    }

    const initialMessages: Message[] = [
      {
        role: "system",
        content: getSystemPrompt(),
      },
      dataBridgeSchema && {
        role: "system",
        content: `Available storage keys and its types:\n${JSON.stringify(dataBridgeSchema, null, 2)}\nUse fetch_from_storage and save_to_storage actions to interact with the storage.`,
      },
      {
        role: "user",
        content: action.task,
      },
    ].filter((message) => !!message)
    const assistantResponses: Message[] = []
    const actionsHistory: NavigationStep["actions"] = []

    const navigationStepSchema = getNavigationStepSchema(!!dataBridgeSchema)
    const jsonSchema = z.toJSONSchema(navigationStepSchema)

    //TODO: check jsonSchema

    if (process.env.NODE_ENV === "development") {
      //TODO: make sure there are no weird zod additions when omitting schema actions
      this.logger.info({ navigationStepSchema: jsonSchema })
    }

    for (let step = 1; step <= (action.maximumSteps ?? 256); step++) {
      const viewportData = await pageContext.page.screenshot({
        type: "jpeg",
        quality: 80,
        fullPage: false,
      })

      const { resizedImageData, originalResolution, resizedResolution } =
        await resizeScreenshot(viewportData)

      const encodedImage = await ollama.encodeImage(resizedImageData)

      const transformCoordinates = async (coordinates: Coordinates) => {
        if (!coordinatesInBounds(coordinates, resizedResolution)) {
          this.logger.error({
            msg: "Coordinates out of bounds, skipping action",
            coordinates,
            resizedResolution,
          })

          return null
        }

        return getAbsoluteCoordinates(
          coordinates,
          originalResolution,
          resizedResolution,
        )
      }

      let response: ChatResponse | null = null
      const messages: Message[] = [
        ...initialMessages,
        ...assistantResponses.slice(-lastResponsesCount),
        {
          role: "user",
          content: `Current page screenshot resolution: (${resizedResolution.width}x${resizedResolution.height})\nCurrent URL: ${pageContext.page.url()}`,
          images: [encodedImage],
        },
      ]

      let attempt = 0
      while (attempt < 4) {
        try {
          response = await ollama.chat({
            model,
            messages,
            format: jsonSchema,
            stream: false,
            ...this.requestOptions,
          })
          break
        } catch (error) {
          this.logger.error(`Error generating response: ${error}`)
          await wait(randomInt(100, 500))
          attempt++
        }
      }

      if (!response) {
        throw new Error(
          `Failed to generate response after ${attempt + 1} attempts`,
        )
      }

      const navigationStep = navigationStepSchema.safeParse(
        JSON.parse(response.message.content),
      )

      if (navigationStep.success) {
        this.logger.info({
          msg: "Navigation step completed",
          step,
          data: navigationStep.data,
        })

        assistantResponses.push({
          role: "assistant",
          content: JSON.stringify(navigationStep.data, null, 2),
        })

        actionsHistory.push(...navigationStep.data.actions)

        if (tooManyActionRepetitions(actionsHistory)) {
          this.logger.warn({
            msg: "Too many same action repetitions",
            step,
            action: navigationStep.data.actions.at(-1),
          })

          assistantResponses.push({
            role: "system",
            content: `The same action has been repeated ${maximumActionRepetitions} times. You must try a different approach.`,
          })
        }

        for (const actionToPerform of navigationStep.data.actions) {
          const answer = await this.handleNavigationStep(
            actionToPerform,
            action,
            pageContext,
            dataBridge,
            performCommonPageAction,
            transformCoordinates,
            (message) => assistantResponses.push(message),
          )

          if (typeof answer === "string") {
            return answer
          }

          await wait(2_000)
        }
      } else {
        this.logger.error({
          msg: "Failed to parse navigation step",
          error: navigationStep.error,
        })
      }
    }

    throw new Error(
      `Agent failed to complete the task in ${action.maximumSteps} steps`,
    )
  }

  private async handleNavigationStep(
    action: NavigationStep["actions"][number],
    {
      useGhostCursor,
    }: PageAction & { type: PageActionType.RunAutonomousAgent },
    pageContext: ScraperPageContext,
    dataBridge: DataBridge,
    performCommonPageAction: (pageAction: PageAction) => Promise<void>,
    transformCoordinates: (
      coordinates: Coordinates,
    ) => Promise<Coordinates | null>,
    pushMessage: (message: Message) => number,
  ) {
    switch (action.actionType) {
      case NavigationActionType.ClickElement:
        {
          const coordinates = await transformCoordinates(pick(action, "x", "y"))

          if (!coordinates) {
            break
          }

          await preciseClick(
            pageContext,
            coordinates,
            {
              useGhostCursor: useGhostCursor,
              waitForNavigation: true,
            },
            this.logger,
          )
        }
        break
      case NavigationActionType.TypeText:
        {
          const modifier = process.platform === "darwin" ? "Meta" : "Control"
          await pageContext.page.keyboard.down(modifier)
          await wait(randomInt(10, 50))
          await pageContext.page.keyboard.press("KeyA")
          await wait(randomInt(10, 50))
          await pageContext.page.keyboard.up(modifier)
          await wait(randomInt(50, 100))
          await pageContext.page.keyboard.press("Backspace")
          await wait(randomInt(50, 100))

          await pageContext.page.keyboard.type(action.text, {
            delay: randomInt(1, 4),
          })

          if (action.pressEnter) {
            await wait(randomInt(100, 500))
            await pageContext.page.keyboard.press("Enter")
          }
        }
        break

      case NavigationActionType.Scroll:
        {
          const viewport = pageContext.page.viewport() ?? {
            width: defaultPreferences.viewportWidth.value,
            height: defaultPreferences.viewportHeight.value,
          }
          const scrollOptions: ScrollOptions = {
            scrollSpeed: 50,
            scrollDelay: randomInt(100, 500),
          }
          switch (action.direction) {
            case "down":
              await pageContext.cursor.scroll(
                { y: viewport.height },
                scrollOptions,
              )
              break
            case "up":
              await pageContext.cursor.scroll(
                { y: -viewport.height },
                scrollOptions,
              )
              break
            case "left":
              await pageContext.cursor.scroll(
                { x: -viewport.width },
                scrollOptions,
              )
              break
            case "right":
              await pageContext.cursor.scroll(
                { x: viewport.width },
                scrollOptions,
              )
              break
          }
        }
        break

      case NavigationActionType.Refresh:
        await performCommonPageAction({
          type: PageActionType.Navigate,
          url: pageContext.page.url(),
        })
        break
      case NavigationActionType.Goto:
        await performCommonPageAction({
          type: PageActionType.Navigate,
          url: action.url,
        })
        break

      case NavigationActionType.FetchFromStorage:
        {
          const returnedValue = await dataBridge.get(
            action.storageKey as ScraperDataKey,
          )
          this.logger.info({
            msg: `Value fetched from ${action.storageKey}`,
            value: returnedValue,
          })
          pushMessage({
            role: "assistant",
            content: `Data fetched from ${action.storageKey}: ${returnedValue}`,
          })
        }
        break
      case NavigationActionType.SaveToStorage:
        {
          const groups = action.items.reduce((acc, item) => {
            try {
              const [sourceName, columnName] = item.storageKey.split(".")
              const items = acc.get(sourceName) ?? []
              items.push({
                columnName,
                value: item.value,
              })
              acc.set(sourceName, items)
            } catch {
              // noop
            }
            return acc
          }, new Map<string, Array<{ columnName: string; value: DataBridgeValue }>>())

          for (const [dataSourceName, items] of groups.entries()) {
            this.logger.info({
              msg: "Saving data batch",
              dataSourceName,
              items,
            })
            await dataBridge.setMany(dataSourceName, items)
          }
        }
        break

      case NavigationActionType.ShowNotification:
        performSystemAction({
          type: SystemActionType.ShowNotification,
          message: action.content,
        })
        break

      case NavigationActionType.Answer: {
        return action.content
      }
    }
  }
}

export function tooManyActionRepetitions(
  actionsHistory: NavigationStep["actions"],
) {
  if (actionsHistory.length < maximumActionRepetitions) {
    return false
  }

  const recentActions = actionsHistory.slice(-maximumActionRepetitions)

  for (let i = 0; i < recentActions.length - 1; i++) {
    if (
      JSON.stringify(recentActions[i]) !== JSON.stringify(recentActions[i + 1])
    ) {
      return false
    }
  }

  return true
}

function getSystemPrompt() {
  return `Imagine that you are a robot browsing the web like a human would. Now, you need to complete a task described by a user.
You can see your last ${lastResponsesCount} responses, which show you what you did in the previous steps.
At each step, you will receive a screenshot of the current webpage along with its URL.
Analyze the screenshots and previous responses carefully to identify the next steps, and then follow the guidelines to choose the next series of actions.
Before taking action, detail your thought process (i.e., reasoning steps).
Also, note the extracted information relevant to solving the task in the notes field.
Once you have enough information in the notes to answer the task, submit an answer with a detailed response in the content field.

You don't always need to interact with the page. Sometimes, the user requires you to read or write storage data, or perform system actions, such as showing a notification.

Guidelines:
- Store all relevant information in the notes to solve the task and fulfill the task criteria. Be precise.
- Use the task and previous responses to decide what to do next.
- Due to the limited context, the notes from the previous ${lastResponsesCount - 1} responses should be repeated and combined with the current notes to avoid losing information necessary for answering the task.
- If there is a cookie notice, privacy policy, or other agreement, accept it first to avoid being blocked.
- If you see relevant information on the screenshot that can help you answer the task, add it to the notes field.
- If there is no relevant information on the screenshot, add an empty string to the notes field.
- If you see buttons that allow you to navigate directly to relevant information, such as "jump to..." or "go to... , use them to navigate faster.
- You can perform multiple actions at once. For example, if you need to fill out an input field, you should perform two actions: first, click on the input field, and then type the text.
- Avoid repeating the same action (e.g., clicking on the same coordinates) more than ${maximumActionRepetitions} times. If you must repeat an action, add a note explaining why.
- Avoid getting stuck on partial goals. You can always change your approach to solve the task.
- In the answer action, provide as many relevant details as possible.
- Remember that you can press Enter automatically after typing to avoid unnecessary clicks.
- Only refresh the page if you encounter a rate limit problem.
- If you encounter a captcha on a website, try to solve it.
- If you have enough information in the screenshot and notes to answer the task, submit an answer with a detailed response in the notes field.
- The current date is ${new Date().toDateString()} ${new Date().toLocaleTimeString("en-GB")}.
`
}
