import * as yup from 'yup'

// eslint-disable-next-line @typescript-eslint/naming-convention
export type AIAction = {
  prompt: string
}

export const upsertAIActionSchema = yup.object({
  prompt: yup.string().required('Prompt is required'),
})
