import { z } from 'zod'

//TODO: add more specific methods like in findElementBy... from jest
export enum ElementSelectorType {
  HTML_SELECTOR = 'htmlSelector',
  AI_PROMPT = 'aiPrompt',
}

export enum ScraperStepType {
  FILL_INPUT = 'fillInput',
  SELECT_OPTION = 'selectOption',
  PRESS_BUTTON = 'pressButton',
  REDIRECT = 'redirect',
}

export const elementSelectorSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(ElementSelectorType.HTML_SELECTOR),
    selector: z.string(),
  }),
  z.object({
    type: z.literal(ElementSelectorType.AI_PROMPT),
    aiPrompt: z.string(),
  }),
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

export const fillInputSchema = z.object({
  element: elementSelectorSchema,
  valueQuery: valueQuerySchema,
  pressEnter: z.boolean().nullable().default(null).optional(),
  delayEnter: z.preprocess(
    (val) => (isNaN(Number(val)) ? undefined : Number(val)),
    z.number().nullable().default(null).optional(),
  ),
  waitForNavigation: waitForNavigationSchema,
  waitForElementTimeout: waitForElementTimeoutSchema,
  waitForNavigationTimeout: waitForNavigationTimeout,
})

export const selectOptionSchema = z.object({
  element: elementSelectorSchema,
  valueQuery: valueQuerySchema,
  waitForElementTimeout: waitForElementTimeoutSchema,
})

export const pressButtonSchema = z.object({
  element: elementSelectorSchema,
  valueQuery: valueQuerySchema,
  pressEnter: z.boolean().nullable().default(null).optional(),
  delayEnter: z.preprocess(
    (val) => (isNaN(Number(val)) ? undefined : Number(val)),
    z.number().nullable().default(null).optional(),
  ),
  waitForNavigation: waitForNavigationSchema,
  waitForElementTimeout: waitForElementTimeoutSchema,
  waitForNavigationTimeout: waitForNavigationTimeout,
})

const urlSchema = z.string().url('Redirect URL must be a valid URL')

const redirectStepDataSchema = z.object({
  url: urlSchema,
})

const scraperStepSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(ScraperStepType.FILL_INPUT),
    data: fillInputSchema,
  }),
  z.object({
    type: z.literal(ScraperStepType.SELECT_OPTION),
    data: selectOptionSchema,
  }),
  z.object({
    type: z.literal(ScraperStepType.PRESS_BUTTON),
    data: pressButtonSchema,
  }),
  z.object({
    type: z.literal(ScraperStepType.REDIRECT),
    data: redirectStepDataSchema,
  }),
])
export type ScraperStep = z.infer<typeof scraperStepSchema>

export const upsertScraperStepSchema = scraperStepSchema
export type UpsertScraperStepSchema = ScraperStep
