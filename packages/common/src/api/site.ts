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

export const upsertSiteTagSchema = yup.object({
  name: yup.string().max(8).default('').required(),
  description: yup.string().nullable().default(null).notRequired(),
})

export type UpsertSiteTagSchema = yup.InferType<typeof upsertSiteTagSchema>

export const upsertSiteSchema = yup
  .object({
    url: yup.string().url().default('').required(),
    language: yup.string().nullable().default(null).notRequired(),
    siteTags: yup
      .array()
      .of(
        upsertSiteTagSchema.concat(
          yup.object({
            id: yup.number().default(0).required(),
          }),
        ),
      )
      .default([])
      .required(),
  })
  .required()

export type UpsertSiteSchema = yup.InferType<typeof upsertSiteSchema>
