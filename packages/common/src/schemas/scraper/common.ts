import { z } from "zod"
import { TAG_NAMES } from "./helpers"

export enum ScraperState {
  /** Pending initial execution */
  Pending = "pending",

  /** Between execution iterations or before clean exit */
  Idle = "idle",

  /** Scraper is currently executing given instructions */
  Executing = "executing",

  /** Scraper has been destroyed, either due to an error, user intervention or it finished all its executions */
  Exited = "exited",

  //TODO: awaiting user action, e.g. captcha
}

export const tagNameSchema = z.enum(TAG_NAMES)

export const serializableRegexSchema = z.object({
  source: z.string(),
  flags: z.string().regex(/^[dgimsuvy]*$/, "Invalid flags"),
})

export type SerializableRegex = z.infer<typeof serializableRegexSchema>

export const pageIndexSchema = z.number().min(0).max(255).optional()
