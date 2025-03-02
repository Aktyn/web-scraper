import { z } from 'zod'

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

//TODO: add more specific methods like in findElementBy... from jest
export enum ElementSelectorType {
  HTML_SELECTOR = 'htmlSelector',
  AI_PROMPT = 'aiPrompt',
}

type ElementSelector =
  | {
      type: ElementSelectorType.HTML_SELECTOR
      /**
       * HTML selector to be used to find elements in the scraping page
       */
      selector: string
    }
  | {
      type: ElementSelectorType.AI_PROMPT
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
        element: ElementSelector
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
      { element: ElementSelector; valueQuery: ValueQuery; waitForElementTimeout?: number }
    >
  | StepBase<
      ScraperStepType.PRESS_BUTTON,
      {
        element: ElementSelector
        waitForNavigation?: boolean
        waitForElementTimeout?: number
        waitForNavigationTimeout?: number
      }
    >
  | StepBase<ScraperStepType.REDIRECT, { url: URL['href'] }>

const elementPathSchema = z.union([
  z.object({
    aiPrompt: z.string().default(''),
  }),
  z.string(),
])

const valueQuerySchema = z.string().optional().nullable().default(null)
const waitForElementTimeoutSchema = z.preprocess(
  (val) => (isNaN(Number(val)) ? undefined : Number(val)),
  z.number().nullable().default(null).optional(),
)
const waitForNavigationSchema = z.boolean().nullable().default(null).optional()
const waitForNavigationTimeout = z.preprocess(
  (val) => (isNaN(Number(val)) ? undefined : Number(val)),
  z.number().nullable().default(null).optional(),
)

// const fillInputSchema = z.object({
//   element: elementPathSchema,
//   valueQuery: valueQuerySchema,
//   pressEnter: z.boolean().nullable().default(null).optional(),
//   delayEnter: z.preprocess(
//     (val) => (isNaN(Number(val)) ? undefined : Number(val)),
//     z.number().nullable().default(null).optional()
//   ),
//   waitForNavigation: waitForNavigationSchema,
//   waitForElementTimeout: waitForElementTimeoutSchema,
//   waitForNavigationTimeout: waitForNavigationTimeout,
// })

// const selectOptionSchema = z.object({
//   element: elementPathSchema,
//   valueQuery: valueQuerySchema,
//   waitForElementTimeout: waitForElementTimeoutSchema,
// })

// const pressButtonSchema = z.object({
//   element: elementPathSchema,
//   valueQuery: valueQuerySchema,
//   pressEnter: z.boolean().nullable().default(null).optional(),
//   delayEnter: z.preprocess(
//     (val) => (isNaN(Number(val)) ? undefined : Number(val)),
//     z.number().nullable().default(null).optional()
//   ),
//   waitForNavigation: waitForNavigationSchema,
//   waitForElementTimeout: waitForElementTimeoutSchema,
//   waitForNavigationTimeout: waitForNavigationTimeout,
// })

const urlSchema = z.string().url('Redirect URL must be a valid URL')

const redirectStepDataSchema = z.object({
  url: urlSchema,
})

const nonRedirectStepDataSchema = z.object({
  element: elementPathSchema.optional(),
  valueQuery: valueQuerySchema.optional(),
  pressEnter: z.boolean().nullable().default(null).optional(),
  delayEnter: z.preprocess(
    (val) => (isNaN(Number(val)) ? undefined : Number(val)),
    z.number().nullable().default(null).optional(),
  ),
  waitForNavigation: waitForNavigationSchema.optional(),
  waitForElementTimeout: waitForElementTimeoutSchema.optional(),
  waitForNavigationTimeout: waitForNavigationTimeout.optional(),
  url: urlSchema.optional().nullable(),
})

export const upsertScraperStepSchema = z.object({
  type: z
    .enum(
      [
        ScraperStepType.FILL_INPUT,
        ScraperStepType.SELECT_OPTION,
        ScraperStepType.PRESS_BUTTON,
        ScraperStepType.REDIRECT,
      ],
      {
        required_error: 'Type is required',
      },
    )
    .default(ScraperStepType.PRESS_BUTTON),
  data: z.union([redirectStepDataSchema, nonRedirectStepDataSchema]).refine(
    (_data) => {
      // No validation needed here, we'll handle it in the parse function
      return true
    },
    {
      message: 'URL is required for redirect step',
      path: ['url'],
    },
  ),
})
