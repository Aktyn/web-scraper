import * as yup from 'yup'

//NOTE: values must be proper SQLite types
export enum DataSourceColumnType {
  TEXT = 'TEXT',
  INTEGER = 'INTEGER',
  REAL = 'REAL',
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
  name: yup.string().min(1).max(32).default('').required(),
  columns: yup
    .array()
    .required()
    .min(1, 'There must be at least 1 column defined')
    .of(
      yup.object({
        name: yup
          .string()
          .min(1, 'Column name is required')
          .max(32)
          .default('')
          .required('Column name is required')
          .notOneOf(['id', 'ID', 'Id', 'iD'], 'id column is reserved'),
        type: yup
          .mixed<DataSourceColumnType>()
          .oneOf(Object.values(DataSourceColumnType))
          .required('Type is required'),
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
        columnName: yup.string().min(1).required(),
        value: yup.lazy((from) =>
          typeof from === 'string' ? yup.string().nullable() : yup.number().nullable(),
        ),
      }),
    ),
})

export type UpsertDataSourceItemSchema = yup.InferType<typeof upsertDataSourceItemSchema>
