import * as yup from 'yup'

export interface Site {
  id: number
  createdAt: Date
  url: string
  language: string | null
  tags: SiteTag[]
}

export interface SiteTag {
  id: number
  name: string
  description: string | null
}

export const upsertSiteSchema = yup
  .object({
    url: yup.string().url().default('').required(),
    language: yup.string().nullable().default(null).notRequired(),
    siteTags: yup
      .array()
      .of(
        yup.object({
          name: yup.string().default('').required(),
          description: yup.string().nullable().default(null).notRequired(),
        }),
      )
      .default([])
      .required(),
  })
  .required()

export type UpsertSiteSchema = yup.InferType<typeof upsertSiteSchema>
