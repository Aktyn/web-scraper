import { z } from 'zod'

// eslint-disable-next-line @typescript-eslint/naming-convention
export type AIAction = {
  prompt: string
}

//TODO: possible deprecation
export const upsertAIActionSchema = z.object({
  prompt: z.string({
    required_error: 'Prompt is required',
  }),
})
