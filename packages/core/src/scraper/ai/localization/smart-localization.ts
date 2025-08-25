import { defaultPreferences, type SimpleLogger } from "@web-scraper/common"
import ollama, { type GenerateRequest } from "ollama"
import type { z } from "zod"
import type { ScraperPageContext } from "../../execution/execution-pages"
import { schemaToJson } from "../common/schema-to-json"
import { ScreenshotTool } from "../common/screenshot-tool"
import { checkModelAvailability } from "../helpers"
import { getCoordinatesSchema } from "./schema"

type RequestOptions = Partial<Pick<GenerateRequest, "model" | "format">> & {
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

    const response = await this.generateResponse(
      prompt,
      encodedImage,
      coordinatesSchema,
    )

    try {
      const coordinates = coordinatesSchema.parse(JSON.parse(response))

      return screenshotTool.transformCoordinates(coordinates)
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

    const schema = schemaToJson(coordinatesSchema)
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
