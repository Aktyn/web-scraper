import * as yup from 'yup'

import { MAX_SQLITE_INTEGER, transformNanToUndefined } from '../common'

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

export const upsertDataSourceStructureSchema = yup.object({
  name: yup
    .string()
    .required()
    .min(1)
    .max(32)
    .matches(/^[^.]+$/u, 'Cannot contain dot (.) character')
    .default(''),
  columns: yup
    .array()
    .required()
    .min(1, 'There must be at least 1 column defined')
    .of(
      yup.object({
        name: yup
          .string()
          .required('Column name is required')
          .min(1, 'Column name is required')
          .max(32)
          .notOneOf(['id', 'ID', 'Id', 'iD'], 'id column is reserved')
          .matches(/^[^.]+$/u, 'Cannot contain dot (.) character')
          .default(''),
        type: yup
          .mixed<DataSourceColumnType>()
          .required('Type is required')
          .oneOf(Object.values(DataSourceColumnType)),
      }),
    ),
})

export type UpsertDataSourceStructureSchema = yup.InferType<typeof upsertDataSourceStructureSchema>

export const upsertDataSourceItemSchema = yup.object({
  data: yup
    .array()
    .required()
    .min(1)
    .of(
      yup.object({
        columnName: yup.string().required().min(1),
        value: yup.lazy((from) =>
          typeof from === 'string'
            ? yup.string().notRequired().nullable().default(null)
            : yup
                .number()
                .notRequired()
                .nullable()
                .default(null)
                .max(MAX_SQLITE_INTEGER)
                .transform(transformNanToUndefined),
        ),
      }),
    ),
})

export type UpsertDataSourceItemSchema = yup.InferType<typeof upsertDataSourceItemSchema>
