import z from "zod"

export enum SqliteColumnType {
  TEXT = "TEXT",
  NUMERIC = "NUMERIC",
  INTEGER = "INTEGER",
  REAL = "REAL",
  BLOB = "BLOB",
  BOOLEAN = "BOOLEAN",
  TIMESTAMP = "TIMESTAMP",
}

const columnSchema = z.object({
  name: z.string().min(1, "Column name is required"),
  type: z.nativeEnum(SqliteColumnType),
  notNull: z.boolean().optional(),
  defaultValue: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
})

export type UserDataStoreColumn = z.infer<typeof columnSchema>

export const userDataStoreSchema = z.object({
  tableName: z.string(),
  name: z.string().min(1, "Table name is required"),
  description: z.string().nullable(),
  recordsCount: z.number(),
  columns: z.array(columnSchema),
})

export type UserDataStore = z.infer<typeof userDataStoreSchema>

export const createUserDataStoreSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  columns: z.array(columnSchema).min(1, "At least one column is required"),
})

export type CreateUserDataStore = z.infer<typeof createUserDataStoreSchema>

export const updateUserDataStoreSchema = createUserDataStoreSchema

export type UpdateUserDataStore = z.infer<typeof updateUserDataStoreSchema>

export const paramsWithTableNameSchema = z.object({
  tableName: z.string(),
})

export const createUserDataStoreRecordSchema = z.record(z.string(), z.unknown())

export type CreateUserDataStoreRecord = z.infer<typeof createUserDataStoreRecordSchema>

export const updateUserDataStoreRecordSchema = createUserDataStoreRecordSchema

export type UpdateUserDataStoreRecord = z.infer<typeof updateUserDataStoreRecordSchema>
