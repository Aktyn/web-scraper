import { z } from 'zod'

import { MAX_SQLITE_INTEGER } from '../common'

//NOTE: values must be proper SQLite types
export enum DataSourceColumnType {
  TEXT = 'TEXT',
  INTEGER = 'INTEGER',
  REAL = 'REAL',
  //TODO: add support for DATETIME type
}

interface DataSourceColumn {
  name: string
  type: DataSourceColumnType
}

export interface DataSourceStructure {
  name: string
  columns: DataSourceColumn[]
}

export interface DataSourceItem {
  id: number
  data: { columnName: string; value: number | string | null }[]
}

export const upsertDataSourceStructureSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(32)
    .regex(/^[^.]+$/u, 'Cannot contain dot (.) character')
    .default(''),
  columns: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, 'Column name is required')
          .max(32)
          .refine((val) => !['id', 'ID', 'Id', 'iD'].includes(val), 'id column is reserved')
          .refine((val) => /^[^.]+$/u.test(val), 'Cannot contain dot (.) character')
          .default(''),
        type: z.enum(Object.values(DataSourceColumnType) as [string, ...string[]]),
      }),
    )
    .min(1, 'There must be at least 1 column defined'),
})

export type UpsertDataSourceStructureSchema = z.infer<typeof upsertDataSourceStructureSchema>

export const upsertDataSourceItemSchema = z.object({
  data: z
    .array(
      z.object({
        columnName: z.string().min(1),
        value: z.union([
          z.string().nullable().default(null),
          z.number().max(MAX_SQLITE_INTEGER).nullable().default(null),
        ]),
      }),
    )
    .min(1),
})

export type UpsertDataSourceItemSchema = z.infer<typeof upsertDataSourceItemSchema>
