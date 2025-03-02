import { z } from 'zod'

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

export const upsertSiteTagSchema = z.object({
  name: z.string().max(8).default(''),
  description: z.string().nullable().default(null).optional(),
})

export type UpsertSiteTagSchema = z.infer<typeof upsertSiteTagSchema>

export const upsertSiteSchema = z.object({
  url: z.string().url().default(''),
  language: z.string().nullable().default(null).optional(),
  siteTags: z
    .array(
      upsertSiteTagSchema.extend({
        id: z.number().default(0),
      }),
    )
    .default([]),
})

export type UpsertSiteSchema = z.infer<typeof upsertSiteSchema>
