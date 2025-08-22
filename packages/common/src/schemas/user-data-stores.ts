import z from "zod"
import { apiPaginationQuerySchema, sortOrderSchema } from "./common/api"

export enum SqliteColumnType {
  TEXT = "TEXT",
  NUMERIC = "NUMERIC",
  INTEGER = "INTEGER",
  REAL = "REAL",
  BOOLEAN = "BOOLEAN",
  TIMESTAMP = "TIMESTAMP",
  BLOB = "BLOB",
}

const columnSchema = z.object({
  name: z.string().min(1, "Column name is required"),
  type: z.enum(SqliteColumnType),
  notNull: z.boolean().optional(),
  defaultValue: z
    .union([z.string(), z.number(), z.boolean(), z.null()])
    .optional(),
})

export type UserDataStoreColumn = z.infer<typeof columnSchema>

export const userDataStoreSchema = z.object({
  tableName: z.string(),
  name: z.string().min(1, "Table name is required"),
  description: z.string().nullable(),
  recordsCount: z.number().int().min(0),
  columns: z.array(columnSchema),
})

export type UserDataStore = z.infer<typeof userDataStoreSchema>

export const createUserDataStoreSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  columns: z
    .array(columnSchema)
    .nonempty({ error: "At least one column is required" }),
})

export type CreateUserDataStore = z.infer<typeof createUserDataStoreSchema>

export const updateUserDataStoreSchema = createUserDataStoreSchema

export type UpdateUserDataStore = z.infer<typeof updateUserDataStoreSchema>

export const paramsWithTableNameSchema = z.object({
  tableName: z.string(),
})

export function upsertUserDataStoreRecordSchemaFactory(
  columns: UserDataStoreColumn[],
) {
  return z.object(
    columns.reduce(
      (acc, column) => {
        if (column.name === "id") {
          return acc
        }

        switch (column.type) {
          case SqliteColumnType.TEXT:
          case SqliteColumnType.NUMERIC:
            acc[column.name] = z.coerce.string()
            break
          case SqliteColumnType.INTEGER:
          case SqliteColumnType.REAL:
          case SqliteColumnType.TIMESTAMP:
            acc[column.name] = z
              .union([z.number(), z.string()])
              .transform((val) => {
                if (typeof val === "string") {
                  if (val === "") {
                    return column.notNull ? 0 : null
                  }
                  const num = Number(val)
                  return isNaN(num) ? null : num
                }
                return val
              })
            break
          case SqliteColumnType.BOOLEAN:
            acc[column.name] = z.coerce.boolean()
            break
          case SqliteColumnType.BLOB:
            // Data URL encoded blob
            acc[column.name] = z.string()
            break
        }
        if (!column.notNull) {
          acc[column.name] = acc[column.name].nullable()
        }
        return acc
      },
      {} as Record<string, z.ZodType<unknown>>,
    ),
  )
}

export type UpsertUserDataStoreRecord = z.infer<
  ReturnType<typeof upsertUserDataStoreRecordSchemaFactory>
>

export const importUserDataStoreSchema = z.object({
  updateRows: z.boolean(),
})

export type ImportUserDataStore = z.infer<typeof importUserDataStoreSchema>

export const exportUserDataStoreSchema = z.object({
  format: z.enum(["csv", "json"]),
  /** Only applicable for JSON format */
  includeColumnDefinitions: z.boolean().optional(),
})

export type ExportUserDataStore = z.infer<typeof exportUserDataStoreSchema>

export const userDataStoreQuerySchema = apiPaginationQuerySchema.extend({
  name: z.string().optional(),
  description: z.string().optional(),
  sortBy: z.enum(["name", "description"]).optional(),
  sortOrder: sortOrderSchema,
})

export type UserDataStoreQuery = z.infer<typeof userDataStoreQuerySchema>

export const userDataStoreRecordsQuerySchema = apiPaginationQuerySchema.extend({
  sortBy: z.string().optional(),
  sortOrder: sortOrderSchema,
  textFilters: z.string().optional(),
})

export type UserDataStoreRecordsQuery = z.infer<
  typeof userDataStoreRecordsQuerySchema
>
