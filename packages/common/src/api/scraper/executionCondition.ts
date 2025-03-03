import { z } from 'zod'

export enum FlowActionType {
  JUMP = 'jump',
}

const executionConditionSchema = z.object({
  condition: z.object({}).passthrough(), //TODO
  flowAction: z.object({
    type: z.enum([FlowActionType.JUMP], {
      errorMap: () => ({ message: 'Flow action type is required' }),
    }),
    targetExecutionItemIndex: z.preprocess(
      (val) => (isNaN(Number(val)) ? undefined : Number(val)),
      z
        .number({
          required_error: 'Target execution item index is required',
        })
        .min(0, 'Target execution item index must be greater than or equal to 0'),
    ),
  }),
})
export type ExecutionCondition = z.infer<typeof executionConditionSchema>

export const upsertExecutionConditionSchema = executionConditionSchema

export type UpsertExecutionConditionSchema = ExecutionCondition
