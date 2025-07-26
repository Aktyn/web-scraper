import { type SimpleLogger, randomString } from "../../utils"
import type { ScraperDataKey } from "../scraper"

export enum SpecialStringType {
  /**
   * Retrieves value from data store by providing data source name/alias and column name\
   * Example: **{{DataKey,dataSourceName.columnName}}**
   */
  DataKey = "DataKey",

  /**
   * Generates random string\
   * Example: **{{RandomString,length}}** where `length` is optional argument and defaults to 16
   */
  RandomString = "RandomString",

  /**
   * Retrieves information about current URL of the page\
   * Example: **{{CurrentLocation,href,pageIndex}}**
   ** `property` is one of URL instance properties except `searchParams` (@see https://developer.mozilla.org/en-US/docs/Web/API/URL#instance_properties)
   ** `pageIndex` is optional and defaults to 0
   */
  CurrentUrl = "CurrentUrl",
}

export type SpecialStringContext = {
  logger: SimpleLogger
  getExternalData: (key: ScraperDataKey) => Promise<string | number | null>
  getPageUrl: (pageIndex?: number) => string | null
}

export async function replaceSpecialStrings(
  text: string,
  context: SpecialStringContext,
): Promise<string> {
  let match: RegExpMatchArray | null = null

  //Search and replace all special strings
  while ((match = text.match(/\{\{([^,}]+),?([^}]+)?}\}/))) {
    if (match.length < 2) {
      break
    }

    const type = match[1] as SpecialStringType
    const args = match.at(2)?.split(",") ?? []

    const value = await getSpecialStringValue(type, args, context)

    text = text.replace(match[0], value?.toString() ?? "")
  }

  return text
}

async function getSpecialStringValue(
  type: SpecialStringType,
  args: string[],
  context: SpecialStringContext,
) {
  switch (type.toLowerCase()) {
    case SpecialStringType.DataKey.toLowerCase():
      if (
        !args
          .at(0)
          ?.trim()
          .match(/^[^.]+\.[^.]+$/)
      ) {
        throw new Error(
          "Data key special string must have at least one argument",
        )
      }
      return await context.getExternalData(args[0].trim() as ScraperDataKey)

    case SpecialStringType.RandomString.toLowerCase():
      return randomString(args.at(0) ? Math.max(parseInt(args[0]), 1) : 16)

    case SpecialStringType.CurrentUrl.toLowerCase(): {
      const [property, pageIndexArg] = args

      if (!property) {
        throw new Error(
          `"${SpecialStringType.CurrentUrl}" special string requires "property" argument`,
        )
      }

      let pageIndex = pageIndexArg ? parseInt(pageIndexArg) : 0
      if (isNaN(pageIndex)) {
        context.logger.warn(`Invalid page index argument: ${pageIndexArg}`)
        pageIndex = 0
      }

      const pageUrl = context.getPageUrl(pageIndex)
      if (!pageUrl) {
        context.logger.warn(
          `Incorrect "${SpecialStringType.CurrentUrl}" "pageIndex" argument; there is no opened page with index = ${pageIndex}`,
        )
        return null
      }
      const url = new URL(pageUrl)

      if (
        property in url &&
        typeof url[property as keyof UrlInstance] === "string"
      ) {
        return url[property as keyof UrlInstance] as UrlProperties
      } else {
        throw new Error(
          `Incorrect "${SpecialStringType.CurrentUrl}" special string. "property" argument is not one of supported URL instance property names`,
        )
      }
    }

    default:
      throw new Error(`Unknown special string type: ${type}`)
  }
}

type UrlInstance = InstanceType<typeof URL>
type UrlProperties = {
  [key in keyof UrlInstance]: UrlInstance[key] extends string ? key : never
}[keyof UrlInstance]
