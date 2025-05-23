import { z } from "zod"

export const preferencesSchema = z.array(
  z.object({
    key: z.string(),
    value: z.string(),
  }),
)

export type Preferences = z.infer<typeof preferencesSchema>
