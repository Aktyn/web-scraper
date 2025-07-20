import { randomString } from "../../utils"
import type { ScraperDataKey } from "../scraper"

export enum SpecialStringType {
  /**
   * Data key special string.\
   * Example: {{DataKey,dataSourceName.columnName}}
   */
  DataKey = "DataKey",

  /**
   * Random string special string.\
   * Example: {{RandomString,length}} where length is optional and defaults to 16.
   */
  RandomString = "RandomString",
}

type ExternalDataGetter = (
  key: ScraperDataKey,
) => Promise<string | number | null>

export async function replaceSpecialStrings(
  text: string,
  getExternalData: ExternalDataGetter,
): Promise<string> {
  let match: RegExpMatchArray | null = null

  //Search and replace all special strings
  while ((match = text.match(/\{\{([^,}]+),?([^}]+)?}\}/))) {
    if (match.length < 2) {
      break
    }

    const type = match[1] as SpecialStringType
    const args = match.at(2)?.split(",") ?? []

    const value = await getSpecialStringValue(type, args, getExternalData)

    text = text.replace(match[0], value?.toString() ?? "")
  }

  return text
}

async function getSpecialStringValue(
  type: SpecialStringType,
  args: string[],
  getExternalData: ExternalDataGetter,
) {
  switch (type) {
    case SpecialStringType.DataKey:
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
      return await getExternalData(args[0].trim() as ScraperDataKey)
    case SpecialStringType.RandomString:
      return randomString(args.at(0) ? Math.max(parseInt(args[0]), 1) : 16)
    default:
      throw new Error(`Unknown special string type: ${type}`)
  }
}
