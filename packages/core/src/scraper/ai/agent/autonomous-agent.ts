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

type RequestOptions = Partial<Pick<ChatRequest, "model">>

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
}
