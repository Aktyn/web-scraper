import {
  type PageAction,
  type ScraperDataKey,
  type SimpleLogger,
  defaultPreferences,
  PageActionType,
  randomInt,
  wait,
} from "@web-scraper/common"
import type { ScrollOptions } from "ghost-cursor"
import ollama, {
  type ChatRequest,
  type ChatResponse,
  type Message,
} from "ollama"
import { systemActions } from "../../../system-actions"
import type { DataBridge, DataBridgeValue } from "../../data-helper"
import type { ScraperPageContext } from "../../execution/execution-pages"
import { preciseClick } from "../../execution/page-actions"
import { schemaToJson } from "../common/schema-to-json"
import { ScreenshotTool } from "../common/screenshot-tool"
import { checkModelAvailability } from "../helpers"
import type { SmartLocalization } from "../localization/smart-localization"
import { type AgentActions, AgentActionType, getAgentSchema } from "./schema"
import { summarizeAgentActions } from "./summary"
import { getSystemMessage } from "./system-message"

type RequestOptions = Partial<Pick<ChatRequest, "model" | "format">>

type AgentActionContext = {
  pageAction: PageAction & { type: PageActionType.RunAutonomousAgent }
  pageContext: ScraperPageContext
  dataBridge: DataBridge
  performCommonPageAction: (pageAction: PageAction) => Promise<void>
  screenshotTool: ScreenshotTool
}

export type ActionsHistory = Array<
  AgentActions[number] & { feedback: string[] }
>

/** Specifies how many previous actions the agent should remember */
const actionsHistorySize = 32

/**
 * Specifies how many times the same action can be repeated\
 * Must be lower than or equal to {@link actionsHistorySize}
 */
const maximumActionRepetitions = 3

export class AutonomousAgent {
  constructor(
    private readonly logger: SimpleLogger,
    private readonly requestOptions: RequestOptions = {},
    private readonly localization: SmartLocalization,
  ) {}

  async run(
    action: PageAction & { type: PageActionType.RunAutonomousAgent },
    pageContext: ScraperPageContext,
    dataBridge: DataBridge,
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

    let dataBridgeSchema: Record<string, string> | null =
      await dataBridge.getSchema()
    if (JSON.stringify(dataBridgeSchema) === "{}") {
      dataBridgeSchema = null
    }

    const actionsHistory: ActionsHistory = []

    const agentSchema = getAgentSchema({
      hasStorageAccess: !!dataBridgeSchema,
    })
    const jsonSchema = schemaToJson(agentSchema)

    if (process.env.NODE_ENV === "development") {
      this.logger.info({ navigationStepSchema: jsonSchema })
    }

    const screenshotTool = new ScreenshotTool(pageContext.page, this.logger)

    for (let step = 1; step <= (action.maximumSteps ?? 256); step++) {
      const { resized } = await screenshotTool.takeScreenshot()
      const encodedImage = await ollama.encodeImage(resized.data)

      const historySummary = summarizeAgentActions(actionsHistory)

      const messages: Message[] = [
        {
          role: "system",
          content: getSystemMessage(
            dataBridgeSchema,
            actionsHistorySize,
            maximumActionRepetitions,
          ),
        },
        {
          role: "user",
          content: action.task,
        },
        historySummary
          ? {
              role: "assistant",
              content: `Summary of previous actions:\n${historySummary}`,
            }
          : null,
        {
          role: "user",
          content: `Current URL: ${pageContext.page.url()}`,
          images: [encodedImage],
        },
      ].filter((msg) => msg !== null)

      //TODO: emit event and show messages in scraper execution info
      // console.log("messages:", [
      //   ...messages.slice(0, messages.length - 1),
      //   {
      //     ...(messages.at(-1) ?? {}),
      //     images: ["<screenshot>"],
      //   },
      // ])

      let response: ChatResponse | null = null
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

      //TODO: wait for https://github.com/ollama/ollama/issues/12362 to use cloud models
      const agentActions = agentSchema.safeParse(
        JSON.parse(response.message.content),
      )

      if (agentActions.success) {
        await this.handleAgentResponse(
          agentActions.data,
          step,
          actionsHistory,
          {
            pageAction: action,
            pageContext,
            dataBridge,
            performCommonPageAction,
            screenshotTool,
          },
        )
      } else {
        this.logger.error({
          msg: "Failed to parse navigation step",
          error: agentActions.error,
        })
      }
    }

    throw new Error(
      `Agent failed to complete the task in ${action.maximumSteps} steps`,
    )
  }

  private async handleAgentResponse(
    actions: AgentActions,
    step: number,
    actionsHistory: ActionsHistory,
    agentActionContext: AgentActionContext,
  ) {
    this.logger.info({
      msg: "AI response received",
      step,
      actions,
    })

    // agentActionContext.pushMessage({
    //   role: "assistant",
    //   content: JSON.stringify(actions, null, 2),
    // })

    // actionsHistory.push(...actions)

    for (const actionToPerform of actions) {
      const action: ActionsHistory[number] = {
        ...actionToPerform,
        feedback: [],
      }

      actionsHistory.push(action)

      if (tooManyActionRepetitions(actionsHistory)) {
        this.logger.warn({
          msg: "Too many same action repetitions",
          step,
          action: actions.at(-1),
        })

        // agentActionContext.pushMessage({
        //   role: "system",
        //   content: `The same action has been repeated ${maximumActionRepetitions} times. You must try a different approach.`,
        // })
        action.feedback.push("This action has been repeated too many times.")
      }

      const finalNotes = await this.performAgentAction(
        action,
        agentActionContext,
      )

      if (typeof finalNotes === "string") {
        return finalNotes
      }

      await wait(2_000)
    }
  }

  private async performAgentAction(
    action: ActionsHistory[number],
    agentActionContext: AgentActionContext,
  ) {
    switch (action.actionType) {
      case AgentActionType.AddNote:
        // {
        //   agentActionContext.pushMessage({
        //     role: "assistant",
        //     content: `Note added:\n${action.content}`,
        //   })
        // }
        break

      case AgentActionType.Click:
        {
          const startUrl = agentActionContext.pageContext.page.url()

          try {
            await this.localizeAndClickElement(
              agentActionContext.pageContext,
              action.elementDescription,
              agentActionContext.pageAction.useGhostCursor,
            )
          } catch (error) {
            this.logger.error({ msg: "Failed to click element", error })

            action.feedback.push(
              "Failed to click element. The described element was not found on the page.",
            )
          }

          if (startUrl !== agentActionContext.pageContext.page.url()) {
            action.feedback.push(
              "The page URL has changed to " +
                agentActionContext.pageContext.page.url(),
            )
          }
        }
        break
      case AgentActionType.Write:
        {
          try {
            await this.localizeAndClickElement(
              agentActionContext.pageContext,
              action.elementDescription,
              agentActionContext.pageAction.useGhostCursor,
            )
          } catch (error) {
            this.logger.error({ msg: "Failed to click element", error })

            action.feedback.push(
              `Failed to write in element. The described element was not found on the page.`,
            )
          }

          const modifier = process.platform === "darwin" ? "Meta" : "Control"
          await agentActionContext.pageContext.page.keyboard.down(modifier)
          await wait(randomInt(10, 50))
          await agentActionContext.pageContext.page.keyboard.press("KeyA")
          await wait(randomInt(10, 50))
          await agentActionContext.pageContext.page.keyboard.up(modifier)
          await wait(randomInt(50, 100))
          await agentActionContext.pageContext.page.keyboard.press("Backspace")
          await wait(randomInt(50, 100))

          await agentActionContext.pageContext.page.keyboard.type(action.text, {
            delay: randomInt(1, 4),
          })

          if (action.pressEnter) {
            const startUrl = agentActionContext.pageContext.page.url()

            await wait(randomInt(100, 500))
            await agentActionContext.pageContext.page.keyboard.press("Enter")

            await agentActionContext.pageContext.page.waitForNavigation({
              waitUntil: "networkidle0",
              timeout: 20_000,
            })

            if (startUrl !== agentActionContext.pageContext.page.url()) {
              action.feedback.push(
                "The page URL has changed to " +
                  agentActionContext.pageContext.page.url(),
              )
            }
          }
        }
        break

      case AgentActionType.Scroll:
        {
          const viewport = agentActionContext.pageContext.page.viewport() ?? {
            width: defaultPreferences.viewportWidth.value,
            height: defaultPreferences.viewportHeight.value,
          }
          const scrollOptions: ScrollOptions = {
            scrollSpeed: 50,
            scrollDelay: randomInt(100, 500),
          }
          switch (action.direction) {
            case "down":
              await agentActionContext.pageContext.cursor.scroll(
                { y: viewport.height },
                scrollOptions,
              )
              break
            case "up":
              await agentActionContext.pageContext.cursor.scroll(
                { y: -viewport.height },
                scrollOptions,
              )
              break
          }
        }
        break

      case AgentActionType.Navigate:
        await agentActionContext.performCommonPageAction({
          type: PageActionType.Navigate,
          url: action.url,
        })
        break

      case AgentActionType.FetchFromStorage:
        {
          const returnedValue = await agentActionContext.dataBridge.get(
            action.storageKey as ScraperDataKey,
          )
          this.logger.info({
            msg: `Value fetched from ${action.storageKey}`,
            value: returnedValue,
          })

          action.feedback.push(`Returned value: ${returnedValue}`)
        }
        break
      case AgentActionType.SaveToStorage:
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
            await agentActionContext.dataBridge.setMany(dataSourceName, items)
          }
        }
        break

      case AgentActionType.ShowNotification:
        systemActions.showNotification(action.content)
        break

      case AgentActionType.Abort: {
        throw new Error(`Agent aborted task. Reason: ${action.reason}`)
      }

      case AgentActionType.Finish: {
        return action.finalNotes
      }
    }
  }

  private async localizeAndClickElement(
    pageContext: ScraperPageContext,
    description: string,
    useGhostCursor?: boolean,
  ) {
    const coordinates = await this.localization.localize(
      description,
      pageContext,
    )

    if (!coordinates) {
      throw new Error(`Element "${description}" not found`)
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
}

export function tooManyActionRepetitions(actionsHistory: ActionsHistory) {
  if (actionsHistory.length < maximumActionRepetitions) {
    return false
  }

  const recentActions = actionsHistory.slice(-maximumActionRepetitions)

  for (let i = 0; i < recentActions.length - 1; i++) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { feedback, ...left } = recentActions[i]
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { feedback: _, ...right } = recentActions[i + 1]

    if (JSON.stringify(left) !== JSON.stringify(right)) {
      return false
    }
  }

  return true
}
