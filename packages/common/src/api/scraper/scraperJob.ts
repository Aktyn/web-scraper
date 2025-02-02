import * as yup from 'yup'
import { upsertExecutionConditionSchema, type ExecutionCondition } from './executionCondition'
import { upsertScraperStepSchema, type ScraperStep } from './scraperStep'
import { upsertAIActionSchema, type AIAction } from './aiAction'

//TODO: data-feed and data-scrape execution types; data-feed will read database record for looping execution; data-scrape will scrape data from web page (scraped data structure would be an array of objects since tables can be scraped) and save to database
//TODO: data in execution can work as dictionary storing key-value data from which data will be picked when needed by execution item

export enum ExecutionItemType {
  CONDITION = 'condition',
  STEP = 'step',
  AI_ACTION = 'ai-action',
}

export type JobExecutionItem =
  | {
      type: ExecutionItemType.CONDITION
      condition: ExecutionCondition
    }
  | {
      type: ExecutionItemType.STEP
      step: ScraperStep
    }
  | {
      type: ExecutionItemType.AI_ACTION
      aiAction: AIAction
    }

export const upsertJobExecutionItemSchema = yup.object({
  type: yup
    .mixed<ExecutionItemType>()
    .oneOf(Object.values(ExecutionItemType))
    .required('Execution item type is required'),

  condition: upsertExecutionConditionSchema
    .when('type', {
      is: ExecutionItemType.CONDITION,
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.strip(),
    })
    .optional(),

  step: upsertScraperStepSchema
    .when('type', {
      is: ExecutionItemType.STEP,
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.strip(),
    })
    .optional(),

  aiAction: upsertAIActionSchema
    .when('type', {
      is: ExecutionItemType.AI_ACTION,
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.strip(),
    })
    .optional(),
})

export type UpsertJobExecutionItemSchema = yup.InferType<typeof upsertJobExecutionItemSchema>

export type ScraperJob = {
  id: number
  createdAt: Date

  name: string
  startUrl: URL['href']

  /**
   * List of execution items that will be executed in order, unless a condition changes the flow
   */
  execution: Array<JobExecutionItem>

  /**
   * Map of simplified page structure snapshots indexed by page URL\
   * If the structure changes it means the AI should be re-prompted for the target elements
   */
  //TODO: implement
  // simplifiedPageStructureSnapshots?: Map<URL['href'], Readonly<SimplifiedPageStructure>>
}

export const upsertScraperJobSchema = yup
  .object({
    name: yup.string().required('Name is required'),
    startUrl: yup.string().url('Start URL must be a valid URL').required('Start URL is required'),
    execution: yup
      .array()
      .of(upsertJobExecutionItemSchema)
      .default([])
      .required()
      .min(1, 'Execution cannot be empty'),
  })
  .required()

export type UpsertScraperJobSchema = yup.InferType<typeof upsertScraperJobSchema>
