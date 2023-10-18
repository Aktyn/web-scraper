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
  [key: string]: number | string
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
          .required('Column name is required'),
        type: yup
          .mixed<DataSourceColumnType>()
          .oneOf(Object.values(DataSourceColumnType))
          .required('Type is required'),
      }),
    ),
})

export type UpsertDataSourceStructureSchema = yup.InferType<typeof upsertDataSourceStructureSchema>
