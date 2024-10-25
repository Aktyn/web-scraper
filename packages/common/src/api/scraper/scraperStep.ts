import * as yup from 'yup'
import { transformNanToUndefined } from '../common'

export enum ScraperStepType {
  FILL_INPUT = 'fillInput',
  // UPLOAD_FILE = 'uploadFile', //TODO: support for file fields
  SELECT_OPTION = 'selectOption',
  PRESS_BUTTON = 'pressButton',
}

type StepBase<Type extends ScraperStepType, Data> = {
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

const elementPathSchema = yup.lazy((value) =>
  typeof value === 'string'
    ? yup.string().required('Element path is required').default('')
    : yup
        .object({
          aiPrompt: yup.string().required('AI prompt is required').default(''),
        })
        .required('AI prompt is required'),
)
const valueQuerySchema = yup.string().notRequired().nullable().default(null)
const waitForElementTimeoutSchema = yup
  .number()
  .transform(transformNanToUndefined)
  .nullable()
  .default(null)
  .notRequired()
const waitForNavigationSchema = yup.boolean().nullable().default(null).notRequired()
const waitForNavigationTimeout = yup
  .number()
  .transform(transformNanToUndefined)
  .nullable()
  .default(null)
  .notRequired()

// const fillInputSchema = yup.object({
//   element: elementPathSchema,
//   valueQuery: valueQuerySchema,
//   pressEnter: yup.boolean().nullable().default(null).notRequired(),
//   delayEnter: yup
//     .number()
//     .transform(transformNanToUndefined)
//     .nullable()
//     .default(null)
//     .notRequired(),
//   waitForNavigation: waitForNavigationSchema,
//   waitForElementTimeout: waitForElementTimeoutSchema,
//   waitForNavigationTimeout: waitForNavigationTimeout,
// })

// const selectOptionSchema = yup.object({
//   element: elementPathSchema,
//   valueQuery: valueQuerySchema,
//   waitForElementTimeout: waitForElementTimeoutSchema,
// })

// const pressButtonSchema = yup.object({
//   element: elementPathSchema,
//   valueQuery: valueQuerySchema,
//   pressEnter: yup.boolean().nullable().default(null).notRequired(),
//   delayEnter: yup
//     .number()
//     .transform(transformNanToUndefined)
//     .nullable()
//     .default(null)
//     .notRequired(),
//   waitForNavigation: waitForNavigationSchema,
//   waitForElementTimeout: waitForElementTimeoutSchema,
//   waitForNavigationTimeout: waitForNavigationTimeout,
// })

export const upsertScraperStepSchema = yup.object({
  type: yup
    .mixed<ScraperStepType>()
    .oneOf(Object.values(ScraperStepType))
    .default(ScraperStepType.PRESS_BUTTON)
    .required('Type is required'),
  // data: yup.lazy((_, options) => {
  //   const parentType = options.parent.type
  //   switch (parentType) {
  //     case ScraperStepType.FILL_INPUT:
  //       return fillInputSchema.required().nullable().default(fillInputSchema.getDefault())
  //     case ScraperStepType.SELECT_OPTION:
  //       return selectOptionSchema.required().nullable().default(selectOptionSchema.getDefault())
  //     case ScraperStepType.PRESS_BUTTON:
  //       return pressButtonSchema.required().nullable().default(pressButtonSchema.getDefault())
  //     default:
  //       return yup.mixed().required('Invalid scraper step type')
  //   }
  // }),
  data: yup
    .object({
      element: elementPathSchema,
      valueQuery: valueQuerySchema,
      pressEnter: yup.boolean().nullable().default(null).notRequired(),
      delayEnter: yup
        .number()
        .transform(transformNanToUndefined)
        .nullable()
        .default(null)
        .notRequired(),
      waitForNavigation: waitForNavigationSchema,
      waitForElementTimeout: waitForElementTimeoutSchema,
      waitForNavigationTimeout: waitForNavigationTimeout,
    })
    .partial()
    .required(),
})
