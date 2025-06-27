import { z } from "zod"
import { resizeScreenshot } from "./image-processing"
import { pick, type SimpleLogger } from "@web-scraper/common"
import zodToJsonSchema from "zod-to-json-schema"
import ollama, { type ChatRequest } from "ollama"

type OllamaChatOptions = Partial<Pick<ChatRequest, "model" | "format">>

const CoordinatesSchema = z.object({
  action: z.literal("click"),
  x: z
    .number()
    .int()
    .describe("The x coordinate, number of pixels from the left edge"),
  y: z
    .number()
    .int()
    .describe("The y coordinate, number of pixels from the top edge."),
})

export class SmartLocalization {
  private static jsonSchema = zodToJsonSchema(CoordinatesSchema)

  private readonly systemPrompt =
    "Localize an element on the GUI image according to user's instructions and output a click position."

  constructor(
    private readonly logger: SimpleLogger,
    private readonly chatOptions: OllamaChatOptions = {},
  ) {}

  async localize(prompt: string, viewportData: Uint8Array) {
    const { resizedImageData, originalResolution, resizedResolution } =
      await resizeScreenshot(viewportData)

    const base64ResizedViewport = resizedImageData.toString("base64")

    const response = await ollama.chat({
      model: "qwen2.5vl:32b",
      messages: [
        {
          role: "system",
          content: this.systemPrompt,
        },
        {
          role: "user",
          content: prompt,
          images: [base64ResizedViewport],
        },
      ],
      format: SmartLocalization.jsonSchema,
      stream: false,
      ...this.chatOptions,
    })

    try {
      const parsedOutput = CoordinatesSchema.parse(
        JSON.parse(response.message.content),
      )

      const coordinates = pick(parsedOutput, "x", "y")

      return {
        x: (coordinates.x * originalResolution.width) / resizedResolution.width,
        y:
          (coordinates.y * originalResolution.height) /
          resizedResolution.height,
      }
    } catch (error) {
      this.logger.error(error)
      return null
    }
  }
}
