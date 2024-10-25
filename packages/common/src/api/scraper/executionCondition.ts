import { transformNanToUndefined } from '../common'
import * as yup from 'yup'

export enum FlowActionType {
  JUMP = 'jump',
}

export type ExecutionCondition = {
  condition: object //TODO
  flowAction: {
    type: FlowActionType.JUMP
    targetExecutionItemIndex: number
  }
}

export const upsertExecutionConditionSchema = yup.object({
  condition: yup.object().required(), //TODO
  flowAction: yup
    .object({
      type: yup.string().equals([FlowActionType.JUMP]).required('Flow action type is required'),
      targetExecutionItemIndex: yup
        .number()
        .transform(transformNanToUndefined)
        .required('Target execution item index is required')
        .min(0, 'Target execution item index must be greater than or equal to 0'),
    })
    .required(),
})
