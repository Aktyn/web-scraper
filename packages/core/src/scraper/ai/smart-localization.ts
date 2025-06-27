import { z } from "zod"
import { resizeScreenshot } from "./image-processing"
import {
  defaultPreferences,
  pick,
  type SimpleLogger,
} from "@web-scraper/common"
import zodToJsonSchema from "zod-to-json-schema"
import ollama, { type ChatRequest } from "ollama"

type ChatOptions = Partial<Pick<ChatRequest, "model" | "format">> & {
  systemPrompt?: string
}

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

  /** This function will throw an error if ollama is not installed */
  public static async checkModelAvailability(modelName: string) {
    const list = await ollama.list()

    return list.models.some(
      (model) =>
        model.name.toLowerCase() === modelName.toLowerCase() ||
        model.model.toLowerCase() === modelName.toLowerCase(),
    )
  }

  constructor(
    private readonly logger: SimpleLogger,
    private readonly chatOptions: ChatOptions = {},
  ) {}

  async localize(prompt: string, viewportData: Uint8Array) {
    const model =
      this.chatOptions.model || defaultPreferences.localizationModel.value

    const modelAvailable = await SmartLocalization.checkModelAvailability(model)

    if (!modelAvailable) {
      throw new Error(
        `Model "${model}" is not available. It must be pulled from Ollama first.`,
      )
    }

    const { resizedImageData, originalResolution, resizedResolution } =
      await resizeScreenshot(viewportData)

    const encodedImage = await ollama.encodeImage(resizedImageData)

    const response = await ollama.chat({
      model,
      messages: [
        this.chatOptions.systemPrompt && {
          role: "system",
          content: this.chatOptions.systemPrompt,
        },
        {
          role: "user",
          content: prompt,
          images: [encodedImage],
        },
      ].filter((message) => !!message),
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
