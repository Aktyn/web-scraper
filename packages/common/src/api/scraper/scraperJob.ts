import { z } from 'zod'
import { upsertExecutionConditionSchema } from './executionCondition'
import { upsertScraperStepSchema } from './scraperStep'

//TODO: data-feed and data-scrape execution types; data-feed will read database record for looping execution; data-scrape will scrape data from web page (scraped data structure would be an array of objects since tables can be scraped) and save to database
//TODO: data in execution can work as dictionary storing key-value data from which data will be picked when needed by execution item

export enum ExecutionItemType {
  CONDITION = 'condition',
  STEP = 'step',
  // AI_ACTION = 'ai-action',
}

const jobExecutionItemSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(ExecutionItemType.CONDITION),
    condition: upsertExecutionConditionSchema,
  }),
  z.object({
    type: z.literal(ExecutionItemType.STEP),
    step: upsertScraperStepSchema,
  }),
  // z.object({
  //   type: z.literal(ExecutionItemType.AI_ACTION),
  //   aiAction: upsertAIActionSchema,
  // }),
])
export type JobExecutionItem = z.infer<typeof jobExecutionItemSchema>

export const upsertJobExecutionItemSchema = jobExecutionItemSchema
export type UpsertJobExecutionItemSchema = JobExecutionItem

const scraperJobSchema = z.object({
  id: z.number(),
  createdAt: z.date(),
  name: z.string({
    required_error: 'Name is required',
  }),
  startUrl: z
    .string({
      required_error: 'Start URL is required',
    })
    .url('Start URL must be a valid URL'),
  /**
   * List of execution items that will be executed in order, unless a condition changes the flow
   */
  execution: z
    .array(upsertJobExecutionItemSchema)
    .default([])
    .refine((items) => items.length >= 1, {
      message: 'Execution cannot be empty',
    }),

  /**
   * Map of simplified page structure snapshots indexed by page URL\
   * If the structure changes it means the AI should be re-prompted for the target elements
   */
  //TODO: implement
  // simplifiedPageStructureSnapshots?: Map<URL['href'], Readonly<SimplifiedPageStructure>>
})
export type ScraperJob = z.infer<typeof scraperJobSchema>

export const upsertScraperJobSchema = scraperJobSchema.omit({
  id: true,
  createdAt: true,
})
export type UpsertScraperJobSchema = z.infer<typeof upsertScraperJobSchema>
