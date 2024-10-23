import * as yup from 'yup'
import { transformNanToUndefined } from '../common'

export enum ScraperStepType {
  FILL_INPUT = 'fillInput',
  // UPLOAD_FILE = 'uploadFile', //TODO: support for file fields
  SELECT_OPTION = 'selectOption',
  PRESS_BUTTON = 'pressButton',
}

type StepBase<Type extends ScraperStepType, Data> = {
  uuid: string
  type: Type
  data: Data
}

type ElementPath =
  | string
  | {
      /**
       * Prompt to be used by AI to find the element based on simplified page structure
       */
      aiPrompt: string
    }

type ValueQuery = string //TODO: support data-feed

export type ScraperStep =
  | StepBase<
      ScraperStepType.FILL_INPUT,
      {
        element: ElementPath
        valueQuery: ValueQuery
        pressEnter?: boolean
        delayEnter?: number
        waitForNavigation?: boolean
        waitForNavigationTimeout?: number
        waitForElementTimeout?: number
      }
    >
  | StepBase<
      ScraperStepType.SELECT_OPTION,
      { element: ElementPath; valueQuery: ValueQuery; waitForElementTimeout?: number }
    >
  | StepBase<
      ScraperStepType.PRESS_BUTTON,
      {
        element: ElementPath
        waitForNavigation?: boolean
        waitForElementTimeout?: number
        waitForNavigationTimeout?: number
      }
    >

export const upsertScraperStepSchema = yup.object({
  uuid: yup.string().required(),
  type: yup
    .mixed<ScraperStepType>()
    .oneOf(Object.values(ScraperStepType))
    .required('Type is required'),
  data: yup
    .object({
      element: yup.string().notRequired().nullable().default(null),
      valueQuery: yup.string().notRequired().nullable().default(null),
      pressEnter: yup.boolean().nullable().default(null).notRequired(),
      delayEnter: yup
        .number()
        .transform(transformNanToUndefined)
        .nullable()
        .default(null)
        .notRequired(),
      waitForNavigation: yup.boolean().nullable().default(null).notRequired(),
      waitForElementTimeout: yup
        .number()
        .transform(transformNanToUndefined)
        .nullable()
        .default(null)
        .notRequired(),
      waitForNavigationTimeout: yup
        .number()
        .transform(transformNanToUndefined)
        .nullable()
        .default(null)
        .notRequired(),
    })
    .partial()
    .nullable()
    .default(null)
    .notRequired(),
})
