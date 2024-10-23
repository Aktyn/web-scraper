import * as yup from 'yup'
import type { SimplifiedPageStructure } from './common'
import { upsertExecutionConditionSchema, type ExecutionCondition } from './executionCondition'
import { upsertScraperStepSchema, type ScraperStep } from './scraperStep'

//TODO: data-feed and data-scrape execution types; data-feed will read database record for looping execution; data-scrape will scrape data from web page (scraped data structure would be an array of objects since tables can be scraped) and save to database
//TODO: data in execution can work as dictionary storing key-value data from which data will be picked when needed by execution item

type ExecutionItemBase<Data extends { type: string }> = Data & {
  executionItemIndex: number
}

type JobExecutionItem =
  | ExecutionItemBase<{
      type: 'condition'
      condition: ExecutionCondition
    }>
  | ExecutionItemBase<{
      type: 'step'
      step: ScraperStep
    }>

const upsertJobExecutionItemSchema = yup.object({
  executionItemIndex: yup.number().required(),
  type: yup.string().oneOf(['condition', 'step']).required(),

  condition: upsertExecutionConditionSchema.when('type', {
    is: 'condition',
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.strip(),
  }),

  step: upsertScraperStepSchema.when('type', {
    is: 'step',
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.strip(),
  }),
})

export type UpsertJobExecutionItemSchema = yup.InferType<typeof upsertJobExecutionItemSchema>

export type ScraperJob = {
  uuid: string
  name: string

  /**
   * List of execution items that will be executed in order, unless a condition changes the flow
   */
  execution: Array<JobExecutionItem>

  /**
   * Map of simplified page structure snapshots indexed by page URL\
   * If the structure changes it means the AI should be re-prompted for the target elements
   */
  simplifiedPageStructureSnapshots: Map<URL['href'], Readonly<SimplifiedPageStructure>>
}

export const upsertScraperJobSchema = yup
  .object({
    uuid: yup.string().required(),
    name: yup.string().required(),
    execution: yup.array().of(upsertJobExecutionItemSchema).default([]).required(),
  })
  .required()

export type UpsertScraperJobSchema = yup.InferType<typeof upsertScraperJobSchema>
