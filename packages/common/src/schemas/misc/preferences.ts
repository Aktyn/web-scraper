import { z } from "zod"
import { defaultPreferences } from "../../config"

type PreferenceKey = keyof typeof defaultPreferences

export const userPreferencesSchema = z.array(
  z.object({
    key: z.enum(
      Object.keys(defaultPreferences) as [PreferenceKey, ...PreferenceKey[]],
    ),
    value: z.custom<Required<unknown>>((x) => x !== undefined),
  }),
)

export type UserPreferences = z.infer<typeof userPreferencesSchema>
