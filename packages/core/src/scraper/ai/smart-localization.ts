import {
  defaultPreferences,
  pick,
  type SimpleLogger,
} from "@web-scraper/common"
import ollama, { type GenerateRequest } from "ollama"
import zodToJsonSchema from "zod-to-json-schema"
import { checkModelAvailability, getAbsoluteCoordinates } from "./helpers"
import { resizeScreenshot } from "./image-processing"
import { coordinatesSchema } from "./schemas"

type RequestOptions = Partial<Pick<GenerateRequest, "model" | "format">> & {
  systemPrompt?: string
}

export class SmartLocalization {
  private static jsonSchema = zodToJsonSchema(coordinatesSchema)

  constructor(
    private readonly logger: SimpleLogger,
    private readonly requestOptions: RequestOptions = {},
  ) {}

  async localize(prompt: string, viewportData: Uint8Array) {
    const { resizedImageData, originalResolution, resizedResolution } =
      await resizeScreenshot(viewportData)

    const encodedImage = await ollama.encodeImage(resizedImageData)

    const response = await this.generateResponse(prompt, encodedImage)

    try {
      const parsedOutput = coordinatesSchema.parse(JSON.parse(response))

      const coordinates = pick(parsedOutput, "x", "y")

      return getAbsoluteCoordinates(
        coordinates,
        originalResolution,
        resizedResolution,
      )
    } catch (error) {
      this.logger.error(error)
      return null
    }
  }

  async generateResponse(prompt: string, encodedImage: string) {
    const model =
      this.requestOptions.model || defaultPreferences.localizationModel.value

    const modelAvailable = await checkModelAvailability(model)

    if (!modelAvailable) {
      throw new Error(
        `Model "${model}" is not available. It must be pulled from Ollama first.`,
      )
    }

    const { response } = await ollama.generate({
      model,
      system: this.requestOptions.systemPrompt,
      prompt: prompt,
      images: [encodedImage],
      format: SmartLocalization.jsonSchema,
      stream: false,
      ...this.requestOptions,
    })

    return response
  }
}
