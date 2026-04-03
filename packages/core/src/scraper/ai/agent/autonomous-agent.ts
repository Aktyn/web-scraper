import {
  type PageActionType,
  type PageAction,
  type SimpleLogger,
  defaultPreferences,
  omit,
  randomInt,
  wait,
} from "@web-scraper/common"
import ollama, {
  type ChatRequest,
  type ChatResponse,
  type Message,
} from "ollama"
import type { DataBridge } from "../../data-helper"
import type { ScraperPageContext } from "../../execution/execution-pages"
import { ScreenshotTool } from "../common/screenshot-tool"
import { checkModelAvailability } from "../helpers"
import { getAgentSystemMessage } from "./agent-system-message"
import {
  type AgentToolContext,
  AGENT_TOOLS,
  AgentToolFunctions,
  AgentToolName,
} from "./agent-tools"
import { type AgentActions } from "./schema"

type RequestOptions = Partial<Pick<ChatRequest, "model">>

export type ActionsHistory = Array<
  AgentActions[number] & { feedback: string[] }
>

/** Specifies how many previous actions the agent should remember */
const actionsHistorySize = 48

/**
 * Specifies how many times the same action can be repeated\
 * Must be lower than or equal to {@link actionsHistorySize}
 */
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

    const screenshotTool = new ScreenshotTool(pageContext.page, this.logger)
    const notes: string[] = []

    const messages: Message[] = [
      {
        role: "system",
        content: getAgentSystemMessage(
          dataBridgeSchema,
          actionsHistorySize,
          maximumActionRepetitions,
        ),
      },
      {
        role: "user",
        content: action.task,
      },
      {
        role: "user",
        content: `Current URL: ${pageContext.page.url()}`,
      },
    ]

    for (let step = 1; step <= (action.maximumSteps ?? 256); step++) {
      //TODO: emit event and show messages in scraper execution info
      // console.log("messages:", [
      //   ...messages.slice(0, messages.length - 1),
      //   {
      //     ...(messages.at(-1) ?? {}),
      //     images: ["<screenshot>"],
      //   },
      // ])

      if (process.env.NODE_ENV === "development") {
        this.logger.info({ messages })
      }

      let response: ChatResponse | null = null
      let attempt = 0
      while (attempt < 4) {
        try {
          response = await ollama.chat({
            model,
            messages,
            tools: Object.values(AGENT_TOOLS),
            stream: false,
            think: true,
            ...this.requestOptions,
          })
          break
        } catch (error) {
          this.logger.error(`Error generating response: ${error}`)
          await wait(randomInt(10_000, 50_000)) // Wait out possible rate limits
          attempt++
        }
      }

      if (!response) {
        throw new Error(
          `Failed to generate response after ${attempt + 1} attempts`,
        )
      }

      const stepResult = await this.handleAgentResponse(
        response.message,
        step,
        {
          logger: this.logger,
          pageAction: action,
          pageContext,
          dataBridge,
          performCommonPageAction,
          screenshotTool,
          notes,
        },
      )

      if (stepResult.taskCompleted) {
        return stepResult.answer
      } else {
        messages.push(omit(response.message, "thinking")) // Remove thinking to minimize tokens usage

        if (stepResult.feedback.some((message) => message.images?.length)) {
          for (const message of messages) {
            if (message.images?.length) {
              message.images = []
              delete message.images
            }
          }
        }

        messages.push(...stepResult.feedback)
      }
    }

    throw new Error(
      `Agent failed to complete the task in ${action.maximumSteps} steps`,
    )
  }

  private async handleAgentResponse(
    agentMessage: ChatResponse["message"],
    step: number,
    agentToolContext: AgentToolContext,
  ): Promise<
    | { feedback: Message[]; taskCompleted: false }
    | { taskCompleted: true; answer: string }
  > {
    this.logger.info({
      msg: "AI response received",
      step,
      agentMessage,
    })

    const feedback: Message[] = []

    const toolCalls = agentMessage.tool_calls ?? []

    for (const call of toolCalls) {
      let toolResult = AgentToolFunctions[call.function.name as AgentToolName](
        call.function.arguments as never,
        agentToolContext,
      )
      if (toolResult instanceof Promise) {
        toolResult = await toolResult
      }

      feedback.push({
        role: "tool",
        tool_name: call.function.name,
        ...toolResult,
      })

      if (call.function.name === AgentToolName.FINISH) {
        return {
          taskCompleted: true,
          answer: toolResult.content,
        }
      }

      await wait(1_000)
    }

    return {
      feedback,
      taskCompleted: false,
    }
  }

  // private async performAgentAction(
  //   action: ActionsHistory[number],
  //   agentActionContext: AgentActionContext,
  // ) {
  //   switch (action.actionType) {
  //     case AgentActionType.AddNote:
  //       // {
  //       //   agentActionContext.pushMessage({
  //       //     role: "assistant",
  //       //     content: `Note added:\n${action.content}`,
  //       //   })
  //       // }
  //       break

  //     case AgentActionType.Click:
  //       {
  //         const startUrl = agentActionContext.pageContext.page.url()

  //         try {
  //           await this.localizeAndClickElement(
  //             agentActionContext.pageContext,
  //             action.elementDescription,
  //             agentActionContext.pageAction.useGhostCursor,
  //           )
  //         } catch (error) {
  //           this.logger.error({ msg: "Failed to click element", error })

  //           action.feedback.push(
  //             "Failed to click element. The described element was not found on the page.",
  //           )
  //         }

  //         if (startUrl !== agentActionContext.pageContext.page.url()) {
  //           action.feedback.push(
  //             "The page URL has changed to " +
  //               agentActionContext.pageContext.page.url(),
  //           )
  //         }
  //       }
  //       break
  //     case AgentActionType.Write:
  //       {
  //         try {
  //           await this.localizeAndClickElement(
  //             agentActionContext.pageContext,
  //             action.elementDescription,
  //             agentActionContext.pageAction.useGhostCursor,
  //           )
  //         } catch (error) {
  //           this.logger.error({ msg: "Failed to click element", error })

  //           action.feedback.push(
  //             `Failed to write in element. The described element was not found on the page.`,
  //           )
  //         }

  //         const modifier = process.platform === "darwin" ? "Meta" : "Control"
  //         await agentActionContext.pageContext.page.keyboard.down(modifier)
  //         await wait(randomInt(10, 50))
  //         await agentActionContext.pageContext.page.keyboard.press("KeyA")
  //         await wait(randomInt(10, 50))
  //         await agentActionContext.pageContext.page.keyboard.up(modifier)
  //         await wait(randomInt(50, 100))
  //         await agentActionContext.pageContext.page.keyboard.press("Backspace")
  //         await wait(randomInt(50, 100))

  //         await agentActionContext.pageContext.page.keyboard.type(action.text, {
  //           delay: randomInt(1, 4),
  //         })

  //         if (action.pressEnter) {
  //           const startUrl = agentActionContext.pageContext.page.url()

  //           await wait(randomInt(100, 500))
  //           await agentActionContext.pageContext.page.keyboard.press("Enter")

  //           await agentActionContext.pageContext.page.waitForNavigation({
  //             waitUntil: "networkidle0",
  //             timeout: 20_000,
  //           })

  //           if (startUrl !== agentActionContext.pageContext.page.url()) {
  //             action.feedback.push(
  //               "The page URL has changed to " +
  //                 agentActionContext.pageContext.page.url(),
  //             )
  //           }
  //         }
  //       }
  //       break

  //     case AgentActionType.Scroll:
  //       {
  //         const viewport = agentActionContext.pageContext.page.viewport() ?? {
  //           width: defaultPreferences.viewportWidth.value,
  //           height: defaultPreferences.viewportHeight.value,
  //         }
  //         const scrollOptions: ScrollOptions = {
  //           scrollSpeed: 50,
  //           scrollDelay: randomInt(100, 500),
  //         }
  //         switch (action.direction) {
  //           case "down":
  //             await agentActionContext.pageContext.cursor.scroll(
  //               { y: viewport.height },
  //               scrollOptions,
  //             )
  //             break
  //           case "up":
  //             await agentActionContext.pageContext.cursor.scroll(
  //               { y: -viewport.height },
  //               scrollOptions,
  //             )
  //             break
  //         }
  //       }
  //       break

  //     case AgentActionType.Navigate:
  //       await agentActionContext.performCommonPageAction({
  //         type: PageActionType.Navigate,
  //         url: action.url,
  //       })
  //       break

  //     case AgentActionType.FetchFromStorage:
  //       {
  //         const returnedValue = await agentActionContext.dataBridge.get(
  //           action.storageKey as ScraperDataKey,
  //         )
  //         this.logger.info({
  //           msg: `Value fetched from ${action.storageKey}`,
  //           value: returnedValue,
  //         })

  //         action.feedback.push(`Returned value: ${returnedValue}`)
  //       }
  //       break
  //     case AgentActionType.SaveToStorage:
  //       {
  //         const groups = action.items.reduce((acc, item) => {
  //           try {
  //             const [sourceName, columnName] = item.storageKey.split(".")
  //             const items = acc.get(sourceName) ?? []
  //             items.push({
  //               columnName,
  //               value: item.value,
  //             })
  //             acc.set(sourceName, items)
  //           } catch {
  //             // noop
  //           }
  //           return acc
  //         }, new Map<string, Array<{ columnName: string; value: DataBridgeValue }>>())

  //         for (const [dataSourceName, items] of groups.entries()) {
  //           this.logger.info({
  //             msg: "Saving data batch",
  //             dataSourceName,
  //             items,
  //           })
  //           await agentActionContext.dataBridge.setMany(dataSourceName, items)
  //         }
  //       }
  //       break

  //     case AgentActionType.ShowNotification:
  //       systemActions.showNotification(action.content)
  //       break

  //     case AgentActionType.Abort: {
  //       throw new Error(`Agent aborted task. Reason: ${action.reason}`)
  //     }

  //     case AgentActionType.Finish: {
  //       return action.finalNotes
  //     }
  //   }
  // }
}
