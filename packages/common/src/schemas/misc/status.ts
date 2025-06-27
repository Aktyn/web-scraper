import { z } from "zod"

export const statusSchema = z.object({
  ollamaInstalled: z.boolean(),
  localizationModelAvailable: z.boolean(),
})

export type Status = z.infer<typeof statusSchema>
