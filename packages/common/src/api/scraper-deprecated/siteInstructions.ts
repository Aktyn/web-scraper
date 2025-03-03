import { z } from 'zod'

import { upsertActionSchema, type Action } from './action'
import { upsertProcedureSchema, type Procedure } from './procedure'

export interface SiteInstructions {
  id: number
  createdAt: Date
  siteId: number
  actions: Action[]
  procedures: Procedure[]
}

export const upsertSiteInstructionsSchema = z.object({
  procedures: z.array(upsertProcedureSchema.omit({ siteInstructionsId: true })).default([]),
  actions: z
    .array(upsertActionSchema.omit({ siteInstructionsId: true }))
    .refine(
      (value) => (value ? value.length === new Set(value.map((v) => v.name))?.size : true),
      'Multiple actions with the same name are not allowed',
    )
    .default([]),
})

export type UpsertSiteInstructionsSchema = z.infer<typeof upsertSiteInstructionsSchema>
