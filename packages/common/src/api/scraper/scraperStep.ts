import * as yup from 'yup'
import { transformNanToUndefined } from '../common'

export enum ScraperStepType {
  FILL_INPUT = 'fillInput',
  SELECT_OPTION = 'selectOption',
  PRESS_BUTTON = 'pressButton',
  REDIRECT = 'redirect',
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
  | StepBase<ScraperStepType.REDIRECT, { url: URL['href'] }>

const elementPathSchema = yup.lazy((value) =>
  typeof value === 'object' && value !== null
    ? yup.object({
        aiPrompt: yup.string().default(''),
      })
    : yup.string().required('Element path is required').default(''),
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

const urlSchema = yup.string().url('Redirect URL must be a valid URL')

const redirectStepDataSchema = yup.object({
  url: urlSchema,
})

const nonRedirectStepDataSchema = yup
  .object({
    element: elementPathSchema,
    valueQuery: valueQuerySchema,
    pressEnter: yup.boolean().nullable().default(null),
    delayEnter: yup.number().transform(transformNanToUndefined).nullable().default(null),
    waitForNavigation: waitForNavigationSchema,
    waitForElementTimeout: waitForElementTimeoutSchema,
    waitForNavigationTimeout: waitForNavigationTimeout,
    url: urlSchema.notRequired().nullable(),
  })
  .partial()
  .required()

export const upsertScraperStepSchema = yup.object({
  type: yup
    .mixed<ScraperStepType>()
    .oneOf(Object.values(ScraperStepType))
    .default(ScraperStepType.PRESS_BUTTON)
    .required('Type is required'),
  data: nonRedirectStepDataSchema.when('type', {
    is: ScraperStepType.REDIRECT,
    then: () => redirectStepDataSchema,
    otherwise: (schema) => schema.required(),
  }),
})
