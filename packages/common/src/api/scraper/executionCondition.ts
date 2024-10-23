import * as yup from 'yup'

export type ExecutionCondition = {
  condition: object //TODO
  flowAction: {
    type: 'jump'
    targetExecutionItemIndex: number
  }
}

export const upsertExecutionConditionSchema = yup.object({
  condition: yup.object().required(), //TODO
  flowAction: yup
    .object({
      type: yup.string().equals(['jump']).required(),
      targetExecutionItemIndex: yup.number().required(),
    })
    .required(),
})
