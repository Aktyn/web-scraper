// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import * as yup from 'yup'

import { upsertActionSchema, type Action } from './action'
import { upsertProcedureSchema, type Procedure } from './procedure'

export interface SiteInstructions {
  id: number
  createdAt: Date
  siteId: number
  actions: Action[]
  procedures: Procedure[]
}

export const upsertSiteInstructionsSchema = yup
  .object({
    procedures: yup
      .array()
      .of(upsertProcedureSchema.omit(['siteInstructionsId']))
      .default([])
      .required(),
    actions: yup
      .array()
      .of(upsertActionSchema.omit(['siteInstructionsId']))
      .test('unique', 'Multiple actions with the same name are not allowed', (value) =>
        value ? value.length === new Set(value.map((v) => v.name))?.size : true,
      )
      .default([])
      .required(),
  })
  .required()

export type UpsertSiteInstructionsSchema = yup.InferType<typeof upsertSiteInstructionsSchema>
