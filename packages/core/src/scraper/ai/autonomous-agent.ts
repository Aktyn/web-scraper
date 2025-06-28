import {
  defaultPreferences,
  PageActionType,
  pick,
  randomInt,
  wait,
  type PageAction,
  type SimpleLogger,
} from "@web-scraper/common"
import ollama, { type ChatRequest } from "ollama"
import zodToJsonSchema from "zod-to-json-schema"
import type { ScraperPageContext } from "../execution/execution-pages"
import { checkModelAvailability, getAbsoluteCoordinates } from "./helpers"
import { resizeScreenshot } from "./image-processing"
import {
  type NavigationStep,
  NavigationActionType,
  NavigationStepSchema,
} from "./schemas"
import type { ScrollOptions } from "ghost-cursor"
import { preciseClick } from "../execution/page-actions"

type RequestOptions = Partial<Pick<ChatRequest, "model" | "format">>

/** Specifies how many previous observations to include in the system prompt */
const lastObservationsCount = 5

type Observation = {
  step: number
  response: NavigationStep
}

export class AutonomousAgent {
  private static jsonSchema = zodToJsonSchema(NavigationStepSchema)

  constructor(
    private readonly logger: SimpleLogger,
    private readonly requestOptions: RequestOptions = {},
  ) {}

  async run(
    action: PageAction & { type: PageActionType.RunAutonomousAgent },
    pageContext: ScraperPageContext,
    performCommonPageAction: (pageAction: PageAction) => Promise<void>,
  ) {
    const model =
      this.requestOptions.model || defaultPreferences.navigationModel.value

    const modelAvailable = await checkModelAvailability(model)

    if (!modelAvailable) {
      throw new Error(
        `Model "${model}" is not available. It must be pulled from Ollama first.`,
      )
    }

    const observations: Observation[] = []

    for (let step = 1; step <= (action.maximumSteps ?? 256); step++) {
      const viewportData = await pageContext.page.screenshot({
        type: "jpeg",
        quality: 80,
        fullPage: false,
      })

      const { resizedImageData, originalResolution, resizedResolution } =
        await resizeScreenshot(viewportData)

      const encodedImage = await ollama.encodeImage(resizedImageData)

      const response = await ollama.chat({
        model,
        messages: [
          {
            role: "system",
            content: getSystemPrompt(),
          },
          {
            role: "user",
            content: buildStepContent(
              action.task,
              observations.slice(-lastObservationsCount),
            ),
            images: [encodedImage],
          },
        ],
        format: AutonomousAgent.jsonSchema,
        stream: false,
        ...this.requestOptions,
      })

      const navigationStep = NavigationStepSchema.parse(
        JSON.parse(response.message.content),
      )

      this.logger.info({
        msg: "Navigation step completed",
        step,
        ...pick(navigationStep, "note", "thought", "action"),
      })

      observations.push({
        step,
        response: navigationStep,
      })

      switch (navigationStep.action.action) {
        case NavigationActionType.ClickElement:
          {
            // TODO: add option to smart localize element by navigationStep.action.element with another AI request to dedicated localization model

            const absoluteClickPosition = getAbsoluteCoordinates(
              pick(navigationStep.action, "x", "y"),
              originalResolution,
              resizedResolution,
            )

            await preciseClick(
              pageContext,
              absoluteClickPosition,
              {
                useGhostCursor: action.useGhostCursor,
                waitForNavigation: true,
              },
              this.logger,
            )
          }
          break
        case NavigationActionType.WriteElement:
          {
            const absoluteClickPosition = getAbsoluteCoordinates(
              pick(navigationStep.action, "x", "y"),
              originalResolution,
              resizedResolution,
            )

            await preciseClick(
              pageContext,
              absoluteClickPosition,
              {
                useGhostCursor: action.useGhostCursor,
                waitForNavigation: false,
              },
              this.logger,
            )

            await pageContext.page.keyboard.type(
              navigationStep.action.content,
              {
                delay: randomInt(1, 4),
              },
            )

            if (navigationStep.action.pressEnter) {
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
            switch (navigationStep.action.direction) {
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

        //TODO: implement page actions for GoBack, GoForward and Refresh
        case NavigationActionType.GoBack:
          await pageContext.page.goBack({
            timeout: 30_000,
            waitUntil: "networkidle0",
          })
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
            url: navigationStep.action.url,
          })
          break
        case NavigationActionType.Wait:
          await performCommonPageAction({
            type: PageActionType.Wait,
            duration: navigationStep.action.seconds * 1_000,
          })
          break
        case NavigationActionType.Answer: {
          return navigationStep.action.content
        }
      }
    }

    throw new Error(
      `Agent failed to complete the task in ${action.maximumSteps} steps`,
    )
  }
}

function buildStepContent(task: string, observations: Observation[]) {
  return `<task>
${task}
</task>

${observations
  .map(
    (observation) => `<observation step=${observation.step}>
  ${JSON.stringify(observation.response, null, 2)}
</observation>`,
  )
  .join("\n")}
`
}

function getSystemPrompt() {
  return `Imagine you are a robot browsing the web, just like humans. Now you need to complete a task.
In each iteration/step you will receive list of ${lastObservationsCount} observations that includes response from previous steps.
You will also receive the current screenshot of the web page.
Carefully analyze the visual information to identify what to do, then follow the guidelines to choose the following action.
You should detail your thought (i.e. reasoning steps) before taking the action.
Also detail in the notes field of the action the extracted information relevant to solve the task.
Once you have enough information in the notes to answer the task, return an answer action with the detailed answer in the notes field.
This will be evaluated by an evaluator and should match all the criteria or requirements of the task.

Guidelines:
- Store in the notes all the relevant information to solve the task that fulfill the task criteria. Be precise.
- Use both the task and the previous steps notes to decide what to do next.
- If you want to write in a text field and the text field already has text, designate the text field by the text it contains and its type
- If there is a cookies notice, always accept all the cookies first
- Each observation contains response from previous steps up to ${lastObservationsCount} last steps.
- If you see relevant information on the screenshot to answer the task, add it to the notes field of the action.
- If there is no relevant information on the screenshot to answer the task, add an empty string to the notes field of the action.
- If you see buttons that allow to navigate directly to relevant information, like jump to ... or go to ... , use them to navigate faster.
- Sometimes, previous click or write action should be retried due to incorrect coordinates.
- Screenshot content is more important than list of observations and should always be main factor while deciding what to do next.
- In the answer action, give as many details a possible relevant to answering the task.
- If you want to write, don't click before. Directly use the write action
- To write, identify the web element which is type and the text it already contains
- If you want to use a search bar, directly write text in the search bar
- Don't scroll too much. Don't scroll if the number of scrolls is greater than 3
- Don't scroll if you are at the end of the webpage
- Only refresh if you identify a rate limit problem
- If you are looking for a single flights, click on round-trip to select 'one way'
- Never try to login, enter email or password. If there is a need to login, then go back.
- If you are facing a captcha on a website, try to solve it.
- If you have enough information in the screenshot and in the notes to answer the task, return an answer action with the detailed answer in the notes field
- The current date is ${new Date().toString()}
`
}
