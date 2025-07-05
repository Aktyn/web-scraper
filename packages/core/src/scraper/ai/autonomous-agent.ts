import {
  type PageAction,
  type SimpleLogger,
  defaultPreferences,
  PageActionType,
  pick,
  randomInt,
  wait,
} from "@web-scraper/common"
import type { ScrollOptions } from "ghost-cursor"
import ollama, {
  type ChatRequest,
  type ChatResponse,
  type Message,
} from "ollama"
import zodToJsonSchema from "zod-to-json-schema"
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
  type AutonomousAgentAction,
  type NavigationStep,
  NavigationActionType,
  navigationStepSchema,
} from "./schemas"
import type { SmartLocalization } from "./smart-localization"

type RequestOptions = Partial<Pick<ChatRequest, "model" | "format">>

/** Specifies how many previous responses to include in the system prompt */
const lastResponsesCount = 10

/** Specifies how many times the same action can be repeated */
const maximumActionRepetitions = 3

export class AutonomousAgent {
  private static jsonSchema = zodToJsonSchema(navigationStepSchema)

  constructor(
    private readonly logger: SimpleLogger,
    private readonly localization: SmartLocalization,
    private readonly requestOptions: RequestOptions = {},
  ) {}

  async run(
    action: PageAction & { type: PageActionType.RunAutonomousAgent },
    pageContext: ScraperPageContext,
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

    const initialMessages: Message[] = [
      {
        role: "system",
        content: getSystemPrompt(),
      },
      {
        role: "user",
        content: action.task,
      },
    ]
    const assistantResponses: Message[] = []
    const actionsHistory: NavigationStep["actions"] = []

    if (process.env.NODE_ENV === "development") {
      this.logger.info({ navigationStepSchema: AutonomousAgent.jsonSchema })
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
        // if (action.usePreciseLocalization) {
        //   try {
        //     const response = await this.localization.generateResponse(
        //       element,
        //       encodedImage,
        //     )

        //     const parsedOutput = coordinatesSchema.parse(JSON.parse(response))

        //     const originalCoordinates = coordinates
        //     coordinates = pick(parsedOutput, "x", "y")
        //     this.logger.info({
        //       msg: "Precise localization coordinates",
        //       response,
        //     })

        //     if (!coordinatesInBounds(coordinates, resizedResolution)) {
        //       this.logger.error({
        //         msg: "Precise coordinates out of bounds, reverting to original coordinates",
        //         coordinates,
        //         resizedResolution,
        //       })
        //       coordinates = originalCoordinates
        //     }
        //   } catch (error) {
        //     this.logger.error({
        //       msg: "Failed to localize element",
        //       error,
        //     })
        //   }
        // }

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
          content: `Current page screenshot (${resizedResolution.width}x${resizedResolution.height})`,
          images: [encodedImage],
        },
      ]

      let attempt = 0
      while (attempt < 4) {
        try {
          response = await ollama.chat({
            model,
            messages,
            format: AutonomousAgent.jsonSchema,
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
            performCommonPageAction,
            transformCoordinates,
          )

          if (answer) {
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
    action: AutonomousAgentAction,
    {
      useGhostCursor,
    }: PageAction & { type: PageActionType.RunAutonomousAgent },
    pageContext: ScraperPageContext,
    performCommonPageAction: (pageAction: PageAction) => Promise<void>,
    transformCoordinates: (
      coordinates: Coordinates,
    ) => Promise<Coordinates | null>,
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
          // if (!coordinates) {
          //   break
          // }

          // await preciseClick(
          //   pageContext,
          //   coordinates,
          //   {
          //     useGhostCursor: useGhostCursor,
          //     waitForNavigation: false,
          //   },
          //   this.logger,
          // )

          //TODO: allow agent to "clear before type"
          // const modifier = process.platform === "darwin" ? "Meta" : "Control"
          // await pageContext.page.keyboard.down(modifier)
          // await wait(randomInt(10, 50))
          // await pageContext.page.keyboard.press("KeyA")
          // await wait(randomInt(10, 50))
          // await pageContext.page.keyboard.up(modifier)
          // await wait(randomInt(50, 100))
          // await pageContext.page.keyboard.press("Backspace")
          // await wait(randomInt(50, 100))

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
  return `Imagine you are a robot browsing the web, just like humans. Now you need to complete a task described by the user.
You remember ${lastResponsesCount} your last responses which tell you what you already did.
On each step, you will receive the current screenshot of the web page.
Carefully analyze the visual information to identify what to do, then follow the guidelines to choose the next series of actions.
You should detail your thought (i.e. reasoning steps) before taking the action.
Also detail in the notes field the extracted information relevant to solve the task.
Once you have enough information in the notes to answer the task, return an answer action with the detailed answer in the content field.

Guidelines:
- Store in the notes all the relevant information to solve the task that fulfill the task criteria; be precise
- Use both the task and previous responses to decide what to do next
- Due to the limited context, notes before ${lastResponsesCount - 1} previous responses should be repeated and combined with the current notes to avoid losing partial information needed to answer the task
- If there is a cookies notice, privacy policy, or other agreement, always accept them first to avoid being blocked
- If you see relevant information on the screenshot to answer the task, add it to the notes field
- If there is no relevant information on the screenshot to answer the task, add an empty string to the notes field
- If you see buttons that allow to navigate directly to relevant information, like jump to ... or go to ... , use them to navigate faster.
- Don't perform too many actions at once; if you need to fill an input field for example, you should return two actions: first click on the input field and then type the text
- Don't repeat the same exact action (for example clicking on the same coordinates) more than ${maximumActionRepetitions} times; if you repeat the same action, add a note to the action to explain why you repeated it
- Avoid being stuck on partial goals; you can always change approach to solve the task
- In the answer action, give as many details a possible relevant to answering the task
- Remember that you can automatically press enter after typing to avoid unnecessary clicks
- Only refresh the page if you identify a rate limit problem
- If you are facing a captcha on a website, try to solve it
- If you have enough information in the screenshot and in the notes to answer the task, return an answer action with the detailed answer in the notes field
- The current date is ${new Date().toString()}
`
}
