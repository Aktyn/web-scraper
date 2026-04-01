import { defaultPreferences, type SimpleLogger } from "@web-scraper/common"
import ollama, { type ChatRequest, type Message, type Tool } from "ollama"
import type { ScraperPageContext } from "../../execution/execution-pages"
import { type Resolution, ScreenshotTool } from "../common/screenshot-tool"
import { checkModelAvailability } from "../helpers"
import { getCoordinatesSchema } from "./schema"

type RequestOptions = Partial<Pick<ChatRequest, "model">> & {
  systemPrompt?: string
}

export class SmartLocalization {
  constructor(
    private readonly logger: SimpleLogger,
    private readonly requestOptions: RequestOptions = {},
  ) {}

  async localize(prompt: string, pageContext: ScraperPageContext) {
    const screenshotTool = new ScreenshotTool(pageContext.page, this.logger)

    const { resized } = await screenshotTool.takeScreenshot()

    const encodedImage = await ollama.encodeImage(resized.data)

    const coordinatesSchema = getCoordinatesSchema(
      resized.width,
      resized.height,
    )

    const response = await this.generateResponse(prompt, encodedImage, resized)

    try {
      const coordinates = coordinatesSchema.parse(response)

      // Return absolute coordinates based on the original screenshot resolution
      return screenshotTool.transformCoordinates(coordinates)
    } catch (error) {
      this.logger.error(error)
      return null
    }
  }

  private async generateResponse(
    prompt: string,
    encodedImage: string,
    resizedData: Resolution,
  ) {
    const model =
      this.requestOptions.model || defaultPreferences.localizationModel.value

    const modelAvailable = await checkModelAvailability(model)

    if (!modelAvailable) {
      throw new Error(
        `Model "${model}" is not available. It must be pulled from Ollama first.`,
      )
    }

    const messages: Message[] = []

    if (this.requestOptions.systemPrompt) {
      messages.push({
        role: "system",
        content: this.requestOptions.systemPrompt,
      })
    }

    messages.push({
      role: "user",
      content: `${prompt}\n\nThe screenshot has a resolution of ${resizedData.width}x${resizedData.height} pixels.`,
      images: [encodedImage],
    })

    const toolName = "return_coordinates"

    const tools: Tool[] = [
      {
        type: "function",
        function: {
          name: toolName,
          description: "Reply with coordinates of the requested element",
          parameters: {
            type: "object",
            required: ["x", "y"],
            properties: {
              x: {
                type: "integer",
                description:
                  "The X coordinate as number of pixels from the left edge",
              },
              y: {
                type: "integer",
                description:
                  "The Y coordinate as number of pixels from the top edge",
              },
            },
          },
        },
      },
    ]

    const response = await ollama.chat({
      model,
      messages,
      tools,
      stream: false,
      think: false, // Not needed for simple localization task
      ...this.requestOptions,
    })

    // this.logger.info({
    //   msg: "Localization AI response received",
    //   messsage: response.message,
    // })

    if (response.message.tool_calls) {
      for (const call of response.message.tool_calls) {
        if (call.function.name === toolName) {
          const args = call.function.arguments as { x: number; y: number }
          return args
        }
        this.logger.warn(`Unknown tool called: ${call.function.name}`)
        return null
      }
    }

    return null
  }
}
