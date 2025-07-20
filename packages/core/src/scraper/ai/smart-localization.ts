import { defaultPreferences, type SimpleLogger } from "@web-scraper/common"
import ollama, { type GenerateRequest } from "ollama"
import { z } from "zod"
import { checkModelAvailability, getAbsoluteCoordinates } from "./helpers"
import { resizeScreenshot } from "./image-processing"
import { getCoordinatesSchema } from "./schemas"

type RequestOptions = Partial<Pick<GenerateRequest, "model" | "format">> & {
  systemPrompt?: string
}

export class SmartLocalization {
  constructor(
    private readonly logger: SimpleLogger,
    private readonly requestOptions: RequestOptions = {},
  ) {}

  async localize(prompt: string, viewportData: Uint8Array) {
    const { resizedImageData, originalResolution, resizedResolution } =
      await resizeScreenshot(viewportData)

    const encodedImage = await ollama.encodeImage(resizedImageData)

    const coordinatesSchema = getCoordinatesSchema(resizedResolution)

    const response = await this.generateResponse(
      prompt,
      encodedImage,
      coordinatesSchema,
    )

    try {
      const coordinates = coordinatesSchema.parse(JSON.parse(response))

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

  private async generateResponse(
    prompt: string,
    encodedImage: string,
    coordinatesSchema: z.ZodObject,
  ) {
    const model =
      this.requestOptions.model || defaultPreferences.localizationModel.value

    const modelAvailable = await checkModelAvailability(model)

    if (!modelAvailable) {
      throw new Error(
        `Model "${model}" is not available. It must be pulled from Ollama first.`,
      )
    }

    const schema = z.toJSONSchema(coordinatesSchema)
    delete schema["$schema"]
    delete schema["additionalProperties"]

    const { response } = await ollama.generate({
      model,
      system: this.requestOptions.systemPrompt,
      prompt: prompt,
      images: [encodedImage],
      format: schema,
      stream: false,
      ...this.requestOptions,
    })

    return response
  }
}
